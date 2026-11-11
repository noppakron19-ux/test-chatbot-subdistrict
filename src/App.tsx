import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { ChatbotSection } from './components/ChatbotSection';
import { FacebookStudioSection } from './components/FacebookStudioSection';
import { SaoDataManager } from './components/SaoDataManager';
import { SavedPostsSection } from './components/SavedPostsSection';
import {
  SaoProfile,
  Executive,
  KnowledgeItem,
  PrPost,
  ChatMessage,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'facebook' | 'sao_data' | 'saved_posts'>('chat');
  const [studioInitialContent, setStudioInitialContent] = useState('');

  // Main state from Firebase Firestore
  const [profile, setProfile] = useState<SaoProfile>({
    orgName: 'องค์การบริหารส่วนตำบลท่าตูม (อบต.ท่าตูม)',
    district: 'อำเภอศรีมหาโพธิ',
    province: 'จังหวัดปราจีนบุรี',
    websiteUrl: 'https://tt.go.th/public/',
    facebookPage: 'องค์การบริหารส่วนตำบลท่าตูม อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี',
    address: 'เลขที่ 111 หมู่ที่ 8 ถนนปราจีนบุรี–ศรีมหาโพธิ (สาย 3079) ตำบลท่าตูม อำเภอศรีมหาโพธิ จังหวัดปราจีนบุรี 25140',
    phone: '037-285-347, 037-208-854',
    emergencyPhone: '037-285-347 ต่อ 199 หรือ 037-208-854 (สายด่วนกู้ชีพ/บรรเทาสาธารณภัย 24 ชม.)',
    workHours: 'จันทร์ - ศุกร์ เวลา 08.30 - 16.30 น.',
    vision: 'ท่าตูมเมืองน่าอยู่ เคียงคู่อุตสาหกรรมสะอาด คุณภาพชีวิตดี มีธรรมาภิบาล พัฒนาสู่สากล',
    updatedAt: new Date().toISOString(),
  });

  const [executives, setExecutives] = useState<Executive[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [prPosts, setPrPosts] = useState<PrPost[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  const sessionId = 'session_default';

  // 1. Listen to SAO Profile from Firestore
  useEffect(() => {
    const profileDocRef = doc(db, 'sao_profiles', 'main');
    const unsubscribe = onSnapshot(
      profileDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as SaoProfile);
        } else {
          // Initialize if not present
          setDoc(profileDocRef, profile).catch((err) =>
            handleFirestoreError(err, OperationType.CREATE, 'sao_profiles/main')
          );
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'sao_profiles/main');
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Listen to Executives from Firestore
  useEffect(() => {
    const execsColRef = collection(db, 'executives');
    const q = query(execsColRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Executive[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as Executive);
        });
        items.sort((a, b) => (a.order || 99) - (b.order || 99));

        if (items.length === 0 && !isDbInitialized) {
          // Seed defaults from API
          seedDefaultData();
        } else {
          setExecutives(items);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'executives');
      }
    );
    return () => unsubscribe();
  }, [isDbInitialized]);

  // 3. Listen to Knowledge Base Items
  useEffect(() => {
    const kbColRef = collection(db, 'knowledge_items');
    const unsubscribe = onSnapshot(
      kbColRef,
      (snapshot) => {
        const items: KnowledgeItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as KnowledgeItem);
        });
        setKnowledgeItems(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'knowledge_items');
      }
    );
    return () => unsubscribe();
  }, []);

  // 4. Listen to Saved PR Posts
  useEffect(() => {
    const postsColRef = collection(db, 'pr_posts');
    const unsubscribe = onSnapshot(
      postsColRef,
      (snapshot) => {
        const items: PrPost[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as PrPost);
        });
        items.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setPrPosts(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pr_posts');
      }
    );
    return () => unsubscribe();
  }, []);

  // 5. Listen to Chat Messages in session
  useEffect(() => {
    const msgsColRef = collection(db, 'chat_sessions', sessionId, 'messages');
    const unsubscribe = onSnapshot(
      msgsColRef,
      (snapshot) => {
        const items: ChatMessage[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as ChatMessage);
        });
        items.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(items);
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          `chat_sessions/${sessionId}/messages`
        );
      }
    );
    return () => unsubscribe();
  }, [sessionId]);

  // Seed default data helper from server route
  const seedDefaultData = async () => {
    try {
      const res = await fetch('/api/sao-default-data');
      if (!res.ok) return;
      const data = await res.json();

      setIsDbInitialized(true);

      // Save Profile
      await setDoc(doc(db, 'sao_profiles', 'main'), data.profile);

      // Save Executives
      for (const exec of data.executives) {
        const { id, ...execData } = exec;
        await setDoc(doc(db, 'executives', id), execData);
      }

      // Save Knowledge Items
      for (const item of data.knowledgeItems) {
        const { id, ...kbData } = item;
        await setDoc(doc(db, 'knowledge_items', id), kbData);
      }
    } catch (err) {
      console.warn('Seeding default data error:', err);
    }
  };

  // Profile update
  const handleUpdateProfile = async (newProfile: SaoProfile) => {
    try {
      await setDoc(doc(db, 'sao_profiles', 'main'), {
        ...newProfile,
        updatedAt: new Date().toISOString(),
      });
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sao_profiles/main');
    }
  };

  // Executive CRUD
  const handleAddExecutive = async (exec: Omit<Executive, 'id'>) => {
    const path = 'executives';
    try {
      const execId = 'exec_' + Date.now();
      await setDoc(doc(db, path, execId), {
        ...exec,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleUpdateExecutive = async (id: string, exec: Partial<Executive>) => {
    const path = `executives/${id}`;
    try {
      await updateDoc(doc(db, 'executives', id), {
        ...exec,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteExecutive = async (id: string) => {
    const path = `executives/${id}`;
    try {
      await deleteDoc(doc(db, 'executives', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Knowledge Items CRUD
  const handleAddKnowledgeItem = async (item: Omit<KnowledgeItem, 'id'>) => {
    const path = 'knowledge_items';
    try {
      const kbId = 'kb_' + Date.now();
      await setDoc(doc(db, path, kbId), {
        ...item,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleUpdateKnowledgeItem = async (id: string, item: Partial<KnowledgeItem>) => {
    const path = `knowledge_items/${id}`;
    try {
      await updateDoc(doc(db, 'knowledge_items', id), {
        ...item,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteKnowledgeItem = async (id: string) => {
    const path = `knowledge_items/${id}`;
    try {
      await deleteDoc(doc(db, 'knowledge_items', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Save PR Post to Firestore
  const handleSavePost = async (post: Omit<PrPost, 'id'>) => {
    const path = 'pr_posts';
    try {
      const postId = 'post_' + Date.now();
      await setDoc(doc(db, path, postId), {
        ...post,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeletePost = async (id: string) => {
    const path = `pr_posts/${id}`;
    try {
      await deleteDoc(doc(db, 'pr_posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Send message in Chatbot
  const handleSendMessage = async (text: string, isVoice: boolean) => {
    const userMsgId = 'msg_' + Date.now() + '_user';
    const timestamp = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      isVoice,
      timestamp,
    };

    // Save session header if needed
    try {
      await setDoc(
        doc(db, 'chat_sessions', sessionId),
        {
          title: text.slice(0, 50),
          updatedAt: timestamp,
        },
        { merge: true }
      );

      // Save user message
      await setDoc(doc(db, 'chat_sessions', sessionId, 'messages', userMsgId), {
        role: userMessage.role,
        content: userMessage.content,
        isVoice: !!userMessage.isVoice,
        timestamp: userMessage.timestamp,
      });
    } catch (err) {
      console.warn('Failed to save user message to Firestore:', err);
    }

    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          orgContext: {
            ...profile,
            executives,
            knowledgeItems,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อกับ AI ได้');
      }

      const data = await res.json();
      const botMsgId = 'msg_' + Date.now() + '_bot';

      // Save assistant message to Firestore
      await setDoc(doc(db, 'chat_sessions', sessionId, 'messages', botMsgId), {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const botMsgId = 'msg_' + Date.now() + '_bot';
      await setDoc(doc(db, 'chat_sessions', sessionId, 'messages', botMsgId), {
        role: 'assistant',
        content:
          'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง หรือสอบถามเจ้าหน้าที่ อบต. โดยตรงที่เบอร์ ' +
          (profile.phone || '037-285-347'),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    // Delete messages in current session
    for (const msg of messages) {
      try {
        await deleteDoc(doc(db, 'chat_sessions', sessionId, 'messages', msg.id));
      } catch {
        // ignore
      }
    }
    setMessages([]);
  };

  const handleTransferToFacebookStudio = (text: string) => {
    setStudioInitialContent(text);
    setActiveTab('facebook');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

      {/* Main Responsive Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {activeTab === 'chat' && (
          <ChatbotSection
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            isLoading={isChatLoading}
            profile={profile}
            executives={executives}
            knowledgeItems={knowledgeItems}
            onTransferToFacebookStudio={handleTransferToFacebookStudio}
          />
        )}

        {activeTab === 'facebook' && (
          <FacebookStudioSection
            profile={profile}
            initialContent={studioInitialContent}
            onSavePost={handleSavePost}
          />
        )}

        {activeTab === 'sao_data' && (
          <SaoDataManager
            profile={profile}
            executives={executives}
            knowledgeItems={knowledgeItems}
            onUpdateProfile={handleUpdateProfile}
            onAddExecutive={handleAddExecutive}
            onUpdateExecutive={handleUpdateExecutive}
            onDeleteExecutive={handleDeleteExecutive}
            onAddKnowledgeItem={handleAddKnowledgeItem}
            onUpdateKnowledgeItem={handleUpdateKnowledgeItem}
            onDeleteKnowledgeItem={handleDeleteKnowledgeItem}
            onResetDefaultData={seedDefaultData}
          />
        )}

        {activeTab === 'saved_posts' && (
          <SavedPostsSection
            posts={prPosts}
            onDeletePost={handleDeletePost}
            onSelectForStudio={handleTransferToFacebookStudio}
          />
        )}
      </main>
    </div>
  );
}
