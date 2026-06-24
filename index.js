import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  timestamp 
} from 'firebase/firestore';
import { 
  Clipboard, 
  CheckCircle, 
  Users, 
  Settings, 
  Download, 
  ArrowRight, 
  RotateCcw, 
  Info, 
  Database, 
  ChevronRight, 
  Eye, 
  Lock, 
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

// --- CONFIGURASI FIREBASE ---
// Menggunakan konfigurasi otomatis dari environment canvas atau fallback default untuk testing
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "",
      authDomain: "mbti-test-demo.firebaseapp.com",
      projectId: "mbti-test-demo",
      storageBucket: "mbti-test-demo.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abc123xyz"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbti-app-prod';

// --- DATA SOAL TES MBTI (24 Soal Seimbang) ---
const questions = [
  // E (Extraversion) vs I (Introversion)
  { id: 1, text: "Anda sangat menikmati berada di acara sosial atau pertemuan yang ramai dengan banyak orang.", type: "EI", direction: 1 },
  { id: 2, text: "Anda lebih memilih menghabiskan waktu luang sendirian dengan membaca, menonton, atau hobi pribadi.", type: "EI", direction: -1 },
  { id: 3, text: "Anda adalah orang yang mudah memulai percakapan terlebih dahulu dengan orang asing.", type: "EI", direction: 1 },
  { id: 4, text: "Anda merasa kehabisan energi (lelah secara mental) setelah bersosialisasi dalam waktu lama.", type: "EI", direction: -1 },
  { id: 5, text: "Anda merasa lebih produktif bekerja dalam kelompok daripada bekerja sendirian.", type: "EI", direction: 1 },
  { id: 6, text: "Anda lebih suka mendengarkan orang lain berbicara daripada menjadi pusat perhatian.", type: "EI", direction: -1 },

  // S (Sensing) vs N (Intuition)
  { id: 7, text: "Anda lebih tertarik pada fakta-fakta konkret dan dunia nyata dibanding ide-ide teoretis atau abstrak.", type: "SN", direction: 1 },
  { id: 8, text: "Anda sering membayangkan masa depan dan memikirkan berbagai kemungkinan baru yang kreatif.", type: "SN", direction: -1 },
  { id: 9, text: "Anda lebih suka melakukan pekerjaan dengan instruksi langkah-demi-langkah yang sudah jelas jalurnya.", type: "SN", direction: 1 },
  { id: 10, text: "Anda menyukai simbolisme, metafora, dan sering mencari makna tersirat di balik setiap kejadian.", type: "SN", direction: -1 },
  { id: 11, text: "Anda sangat fokus pada detail praktis yang ada saat ini dibanding visi jangka panjang.", type: "SN", direction: 1 },
  { id: 12, text: "Anda cepat bosan dengan rutinitas dan selalu mencari cara-cara baru yang tidak konvensional.", type: "SN", direction: -1 },

  // T (Thinking) vs F (Feeling)
  { id: 13, text: "Dalam mengambil keputusan penting, logika objektif harus selalu diutamakan dibanding perasaan.", type: "TF", direction: 1 },
  { id: 14, text: "Anda sangat berempati dan mudah terpengaruh oleh suasana hati serta emosi orang di sekitar Anda.", type: "TF", direction: -1 },
  { id: 15, text: "Anda lebih suka bersikap jujur dan apa adanya daripada berbohong demi menjaga perasaan orang lain.", type: "TF", direction: 1 },
  { id: 16, text: "Anda memprioritaskan keharmonisan kelompok daripada harus memenangkan suatu argumen atau perdebatan.", type: "TF", direction: -1 },
  { id: 17, text: "Anda mengagumi orang yang bertindak secara rasional, analitis, dan mengesampingkan drama emosional.", type: "TF", direction: 1 },
  { id: 18, text: "Anda sering membuat keputusan berdasarkan insting atau apa yang dirasa benar di dalam hati.", type: "TF", direction: -1 },

  // J (Judging) vs P (Perceiving)
  { id: 19, text: "Anda selalu membuat rencana atau jadwal harian/mingguan yang teratur dan berusaha mematuhinya.", type: "JP", direction: 1 },
  { id: 20, text: "Anda lebih suka bekerja secara fleksibel dan spontan, bahkan di bawah tekanan waktu (SKS).", type: "JP", direction: -1 },
  { id: 21, text: "Bagi Anda, menyelesaikan tugas pekerjaan sebelum bermain adalah aturan hidup yang mutlak.", type: "JP", direction: 1 },
  { id: 22, text: "Anda merasa terkekang jika hari-hari Anda diatur oleh jadwal yang terlalu kaku dan ketat.", type: "JP", direction: -1 },
  { id: 23, text: "Anda merasa sangat tenang dan puas setelah menyelesaikan keputusan atau rencana perjalanan secara detail.", type: "JP", direction: 1 },
  { id: 24, text: "Anda suka membiarkan berbagai pilihan tetap terbuka hingga menit-menit terakhir sebelum bertindak.", type: "JP", direction: -1 }
];

// --- DATA 16 KEPRIBADIAN MBTI (Komprehensif) ---
const mbtiDetails = {
  ISTJ: {
    title: "Logistik / Inspektur",
    desc: "Individu yang praktis, mengutamakan fakta, sangat andal, dan berdedikasi tinggi pada aturan serta tradisi.",
    strengths: ["Jujur & Langsung", "Bertanggung Jawab", "Sangat Detail", "Tenang & Praktis"],
    weaknesses: ["Keras Kepala", "Kurang Sensitif terhadap Emosi", "Terlalu Kaku", "Suka Menyalahkan Diri Sendiri"],
    careers: ["Akuntan", "Analis Keuangan", "Polisi/Militer", "Manajer Operasional", "Hakim/Sistem Hukum"]
  },
  ISFJ: {
    title: "Pembela / Pelindung",
    desc: "Pribadi yang sangat hangat, penuh kasih, protektif, dan selalu siap membela orang-orang terdekat mereka.",
    strengths: ["Sangat Suportif", "Dapat Diandalkan", "Sangat Peka", "Pekerja Keras & Setia"],
    weaknesses: ["Terlalu Rendah Hati", "Terlalu Memendam Perasaan", "Sulit Menolak (People Pleaser)", "Gampang Stres"],
    careers: ["Perawat / Tenaga Medis", "Guru/Pendidik", "Pekerja Sosial", "Customer Service", "Administrasi"]
  },
  INFJ: {
    title: "Advokat / Konselor",
    desc: "Tipe kepribadian paling langka. Idealis yang mistis namun sangat teratur, memiliki visi mendalam tentang manusia.",
    strengths: ["Kreatif", "Sangat Berprinsip", "Penuh Empati & Wawasan", "Bersemangat & Menginspirasi"],
    weaknesses: ["Sensitif terhadap Kritik", "Sangat Tertutup", "Perfeksionis", "Mudah Mengalami Burnout"],
    careers: ["Penulis", "Psikolog / Konselor", "Aktivis Kemanusiaan", "Guru Musik/Seni", "HRD Specialist"]
  },
  INTJ: {
    title: "Arsitek / Ahli Strategi",
    desc: "Pemikir taktis yang imajinatif sekaligus bertekad kuat, sangat mandiri, dan mencintai efisiensi tinggi.",
    strengths: ["Berpikiran Logis & Analitis", "Sangat Mandiri", "Inovatif", "Berpengetahuan Luas"],
    weaknesses: ["Sering Terlihat Arogan", "Terlalu Kritis", "Kurang Peka secara Sosial", "Overthinking"],
    careers: ["Software Engineer / Developer", "Ilmuwan / Peneliti", "Ahli Strategi Bisnis", "Arsitek", "Insinyur"]
  },
  ISTP: {
    title: "Pengrajin / Virtuoso",
    desc: "Eksperimenter yang berani dan praktis, ahli dalam menguasai segala jenis alat, mekanika, dan pemecahan masalah instan.",
    strengths: ["Optimis & Energetik", "Sangat Praktis", "Spontan & Kreatif", "Bagus dalam Krisis Darurat"],
    weaknesses: ["Sangat Keras Kepala", "Suka Menyendiri", "Mudah Bosan", "Kurang Menyukai Komitmen Kaku"],
    careers: ["Teknisi / Mekanik", "Pilot", "Ahli Forensik", "Pekerja Konstruksi", "Pemadam Kebakaran"]
  },
  ISFP: {
    title: "Petualang / Seniman",
    desc: "Seniman yang fleksibel, menawan, selalu siap mengeksplorasi hal-hal baru dan mengekspresikan diri lewat karya nyata.",
    strengths: ["Sangat Menawan", "Sensitif terhadap Estetika", "Imajinatif", "Sangat Fleksibel"],
    weaknesses: ["Sangat Mandiri", "Sulit Diprediksi", "Mudah Stres", "Terlalu Kompetitif secara Diam-diam"],
    careers: ["Desainer Grafis", "Fotografer", "Koki / Chef", "Dokter Hewan", "Musisi / Pekerja Seni"]
  },
  INFP: {
    title: "Mediator / Idealis",
    desc: "Pribadi yang puitis, baik hati, altruistik, dan selalu bersemangat membantu tujuan-tujuan kemanusiaan yang baik.",
    strengths: ["Sangat Peduli & Empati", "Sangat Kreatif", "Berpikiran Terbuka", "Berkomitmen Tinggi pada Nilai"],
    weaknesses: ["Terlalu Idealis", "Sering Mengabaikan Fakta Praktis", "Terlalu Sensitif secara Personal", "Sulit Didekati"],
    careers: ["Penulis / Novelis", "Psikolog", "Penerjemah Bahasa", "Konselor Pendidikan", "Pekerja Seni Kreatif"]
  },
  INTP: {
    title: "Logis / Pemikir",
    desc: "Penemu yang kreatif dengan rasa ingin tahu tinggi, sangat tertarik pada teori, sains, dan struktur analitis.",
    strengths: ["Sangat Analitis", "Orisinal & Kreatif", "Berpikiran Terbuka", "Sangat Jujur & Objektif"],
    weaknesses: ["Sering Ragu-ragu", "Kurang Peka terhadap Perasaan", "Pelupa / Sulit Fokus pada Rutinitas", "Suka Merendahkan Diri"],
    careers: ["Programmer / Data Scientist", "Fisikawan / Matematikawan", "Analis Keamanan Siber", "Filsuf", "Konsultan IT"]
  },
  ESTP: {
    title: "Pengusaha / Dinamis",
    desc: "Orang yang cerdas, bertenaga, sangat ramah, dan sangat menikmati hidup di tepi jurang aksi nyata dan petualangan.",
    strengths: ["Berani & Tegas", "Sangat Rasional & Praktis", "Keterampilan Sosial Hebat", "Peka pada Perubahan"],
    weaknesses: ["Kurang Peka Perasaan", "Suka Mengambil Risiko Berbahaya", "Tidak Suka Aturan Ketat", "Sering Tertinggal Detail"],
    careers: ["Wirausahawan", "Sales / Marketing", "Pialang Saham", "Detektif / Agen Rahasia", "Atlit Profesional"]
  },
  ESFP: {
    title: "Penghibur / Sosialis",
    desc: "Orang yang spontan, energik, bersemangat, dan selalu membuat suasana di sekitar mereka menjadi ceria dan hidup.",
    strengths: ["Sangat Menarik & Menyenangkan", "Suka Membantu Secara Praktis", "Keterampilan Sosial Luar Biasa", "Sensitif terhadap Keindahan"],
    weaknesses: ["Mudah Bosan", "Sulit Merencanakan Masa Depan", "Kurang Fokus pada Analisis Mendalam", "Sangat Sensitif terhadap Konflik"],
    careers: ["Event Planner", "Aktor / Aktris", "Public Relations", "Pemandu Wisata", "Pendidik Anak Usia Dini"]
  },
  ENFP: {
    title: "Juru Kampanye / Inspirator",
    desc: "Jiwa yang bebas, antusias, kreatif, komunikator ulung, dan selalu bisa menemukan alasan untuk tersenyum.",
    strengths: ["Sangat Kreatif & Imajinatif", "Penuh Energi", "Komunikator Ulung", "Sangat Ramah & Populer"],
    weaknesses: ["Sulit Menjaga Fokus", "Sangat Membutuhkan Persetujuan Orang Lain", "Overthinking", "Mudah Stres"],
    careers: ["Content Creator", "Jurnalis", "Manajer Pemasaran", "Konsultan Karir", "Politikus / Motivator"]
  },
  ENTP: {
    title: "Debat / Visioner",
    desc: "Pemikir cerdas yang tidak bisa menolak tantangan intelektual, sangat suka menganalisis argumen dari berbagai sudut.",
    strengths: ["Sangat Cerdas & Berwawasan", "Pemikir Cepat", "Sangat Karismatik", "Suka Menemukan Solusi Baru"],
    weaknesses: ["Sangat Suka Berdebat", "Kurang Toleran pada Ketidaklogisan", "Sulit Fokus pada Implementasi", "Kurang Peka"],
    careers: ["Konsultan Bisnis", "Pengacara / Advokat", "Product Manager", "Wirausahawan", "Direktur Kreatif"]
  },
  ESTJ: {
    title: "Eksekutif / Administrator",
    desc: "Administrator ulung, tidak tertandingi dalam mengelola segala sesuatu, baik itu orang, aturan, maupun proyek.",
    strengths: ["Sangat Terorganisir", "Setia & Berdedikasi", "Jujur & Dapat Dipercaya", "Handal dalam Membuat Ketertiban"],
    weaknesses: ["Kaku & Keras Kepala", "Sulit Menerima Perubahan Cepat", "Sering Terlalu Menuntut", "Kurang Mengekspresikan Emosi"],
    careers: ["Manajer Proyek", "Direktur Keuangan", "Kepala Sekolah / Rektor", "Pejabat Pemerintah", "Analis Sistem"]
  },
  ESFJ: {
    title: "Konsul / Penyedia",
    desc: "Orang-orang yang sangat sosial, peduli, populer, dan selalu bersemangat membantu sesama serta menjaga komunitas.",
    strengths: ["Rasa Tanggung Jawab Kuat", "Sangat Setia & Peduli", "Hebat dalam Menjalin Hubungan", "Sangat Hangat"],
    weaknesses: ["Khawatir tentang Status Sosial", "Sering Butuh Pujian", "Tidak Suka Perubahan Keras", "Sangat Menolak Konflik"],
    careers: ["Guru Sekolah", "Pekerja Sosial medis", "Manajer HRD", "Hubungan Masyarakat", "Dokter Anak"]
  },
  ENFJ: {
    title: "Protagonis / Pemimpin Karismatik",
    desc: "Pemimpin karismatik yang penuh inspirasi, mampu memikat pendengar dan memotivasi orang untuk mencapai potensi terbaik.",
    strengths: ["Sangat Karismatik", "Sangat Peduli & Altruistik", "Komunikator Ulung", "Pemimpin Alami"],
    weaknesses: ["Terlalu Idealistis", "Terlalu Peka terhadap Kritik", "Sering Mengorbankan Diri", "Sulit Membuat Keputusan Keras"],
    careers: ["Guru / Profesor", "Politikus / Pemimpin Organisasi", "Konselor Pernikahan", "Manajer Pelatihan", "Aktivis LSM"]
  },
  ENTJ: {
    title: "Komandan / Pemimpin Strategis",
    desc: "Pemimpin visioner yang berani, bertekad kuat, selalu menemukan jalan atau menciptakan jalan baru untuk kesuksesan.",
    strengths: ["Sangat Efisien", "Percaya Diri Tinggi", "Bertekad Kuat", "Pemikir Strategis yang Ulung"],
    weaknesses: ["Keras Kepala & Dominan", "Kurang Sabar", "Kurang Peka terhadap Emosi", "Sering Terlihat Kejam"],
    careers: ["CEO / Direktur Utama", "Konsultan Manajemen", "Venture Capitalist", "Pengacara Korporasi", "Analis Ekonomi"]
  }
};

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('welcome'); // welcome, test, result, admin, history
  const [userData, setUserData] = useState({ name: '', email: '', whatsapp: '' });
  const [answers, setAnswers] = useState({}); // { questionId: value } di mana value -2 s/d 2
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [resultMBTI, setResultMBTI] = useState(null);
  const [savedSubmissions, setSavedSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorePercentages, setScorePercentages] = useState({ EI: 50, SN: 50, TF: 50, JP: 50 });

  // --- INTEGRASI FIREBASE & AUTH (RULE 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Gagal melakukan autentikasi otomatis:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });

    return () => unsubscribe();
  }, []);

  // --- SNAPSHOT DATA SUBMISSIONS (RULE 1 & RULE 2) ---
  useEffect(() => {
    if (!user) return;

    // Ambil data submission secara real-time dari Firebase Firestore
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'mbti_submissions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort manual di memori (Rule 2: Hindari kompleks query seperti orderBy)
      data.sort((a, b) => b.timestamp - a.timestamp);
      setSavedSubmissions(data);
    }, (error) => {
      console.error("Gagal memuat data dari Firestore:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- FUNGSI NAVIGASI & VALIDASI DATA DIRI ---
  const handleStartTest = (e) => {
    e.preventDefault();
    if (!userData.name.trim() || !userData.email.trim()) {
      alert("Mohon lengkapi Nama Lengkap dan Email Anda terlebih dahulu!");
      return;
    }
    setStep('test');
    setCurrentQIndex(0);
    setAnswers({});
  };

  // --- FUNGSI MEMILIH JAWABAN ---
  const handleAnswerSelect = (score) => {
    const currentQ = questions[currentQIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: score }));

    // Auto next setelah jeda singkat agar transisi mulus
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      }
    }, 200);
  };

  // --- HITUNG SKOR & ANALISIS KEPRIBADIAN ---
  const calculateResult = async () => {
    setIsSubmitting(true);

    let scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    let counts = { EI: 0, SN: 0, TF: 0, JP: 0 };

    questions.forEach(q => {
      const answerVal = answers[q.id] || 0; // nilai -2 sampai +2
      // Direction menentukan apakah skor positif mendukung kutub pertama atau kedua
      // misal untuk EI: + (E), - (I). Jika direction -1, maka jawaban positif justru mendukung I.
      const weightedScore = answerVal * q.direction; 
      scores[q.type] += weightedScore;
      counts[q.type] += 1;
    });

    // Menghitung persentase (Skor ditarik dari rentang teoritis -12 s/d 12 menjadi persentase 0-100)
    // Maksimum skor per dimensi: 6 soal * 2 poin = 12 poin
    const getPercentage = (score) => {
      const normalized = (score + 12) / 24; // rentang 0 s/d 1
      return Math.round(normalized * 100);
    };

    const eiPct = getPercentage(scores.EI);
    const snPct = getPercentage(scores.SN);
    const tfPct = getPercentage(scores.TF);
    const jpPct = getPercentage(scores.JP);

    setScorePercentages({ EI: eiPct, SN: snPct, TF: tfPct, JP: jpPct });

    // Tentukan Huruf MBTI
    const mbtiString = [
      eiPct >= 50 ? 'E' : 'I',
      snPct >= 50 ? 'S' : 'N',
      tfPct >= 50 ? 'T' : 'F',
      jpPct >= 50 ? 'J' : 'P'
    ].join('');

    setResultMBTI(mbtiString);

    // Simpan ke Firestore Database secara Real-time
    const submission = {
      name: userData.name,
      email: userData.email,
      whatsapp: userData.whatsapp || '-',
      mbti: mbtiString,
      percentages: { E: eiPct, I: 100-eiPct, S: snPct, N: 100-snPct, T: tfPct, F: 100-tfPct, J: jpPct, P: 100-jpPct },
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    try {
      if (user) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mbti_submissions'), submission);
      }
    } catch (err) {
      console.error("Gagal menyimpan data ke database:", err);
    }

    setIsSubmitting(false);
    setStep('result');
  };

  // --- EXPORT KE EXCEL (CSV FORMAT DENGAN BOM UNTUK INTEGRASI EXCEL MUDAH) ---
  const exportToExcel = () => {
    if (savedSubmissions.length === 0) {
      alert("Tidak ada data hasil tes untuk diekspor!");
      return;
    }

    // Header baris pertama
    let csvContent = "Nama Lengkap,Email,No. WhatsApp,Hasil MBTI,Tanggal Tes,E (%),I (%),S (%),N (%),T (%),F (%),J (%),P (%)\n";

    // Isi baris demi baris
    savedSubmissions.forEach(sub => {
      const row = [
        `"${sub.name.replace(/"/g, '""')}"`,
        `"${sub.email.replace(/"/g, '""')}"`,
        `"${sub.whatsapp.replace(/"/g, '""')}"`,
        `"${sub.mbti}"`,
        `"${sub.formattedDate}"`,
        `${sub.percentages?.E ?? 50}`,
        `${sub.percentages?.I ?? 50}`,
        `${sub.percentages?.S ?? 50}`,
        `${sub.percentages?.N ?? 50}`,
        `${sub.percentages?.T ?? 50}`,
        `${sub.percentages?.F ?? 50}`,
        `${sub.percentages?.J ?? 50}`,
        `${sub.percentages?.P ?? 50}`
      ].join(",");
      csvContent += row + "\n";
    });

    // Menambahkan UTF-8 Byte Order Mark (BOM) agar Microsoft Excel membaca karakter khusus dengan benar
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hasil_Tes_MBTI_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIN ADMIN ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Default admin password untuk demo, bisa disesuaikan atau disimpan di database
    if (adminPassword === 'adminmbti123') {
      setIsAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError('Password Admin tidak valid! Gunakan: adminmbti123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* HEADER UTAMA */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep('welcome')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                MBTI <span className="text-indigo-400 ml-1.5 font-medium text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Sync Pro</span>
              </h1>
              <p className="text-xs text-slate-400">Tes Kepribadian Real-time & Sinkronisasi Excel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                if (step === 'admin') {
                  setStep('welcome');
                } else {
                  setStep('admin');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                step === 'admin' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              <Settings size={16} />
              <span>{isAdminLoggedIn ? 'Dasbor Admin' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEWPORT UTAMA */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        
        {/* ================= STAGE 1: WELCOME & REGISTRASI ================= */}
        {step === 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full py-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
                <Award size={14} />
                <span>100% Akurat Berdasarkan Teori Carl Jung</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Temukan Potensi <span className="text-indigo-400 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kepribadian Sejati</span> Anda Sekarang!
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Ikuti tes MBTI yang dirancang khusus untuk memetakan cara Anda berinteraksi dengan dunia, mengambil keputusan, dan berkarir secara profesional. Data hasil tes akan tersinkronisasi otomatis untuk kebutuhan analisis ekspor.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="text-indigo-400 font-bold text-2xl mb-1">24 Soal</div>
                  <div className="text-xs text-slate-400">Singkat & Akurat</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="text-purple-400 font-bold text-2xl mb-1">16 Jenis</div>
                  <div className="text-xs text-slate-400">Analisis Mendalam</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="text-emerald-400 font-bold text-2xl mb-1">Real-time</div>
                  <div className="text-xs text-slate-400">Sinkron ke Admin</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users size={20} className="text-indigo-400 mr-2" />
                Mulai Tes Baru
              </h3>
              <p className="text-xs text-slate-400 mb-6">Silakan isi data diri Anda untuk memulai pengujian.</p>
              
              <form onSubmit={handleStartTest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    required
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Alamat Email *</label>
                  <input 
                    type="email" 
                    required
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Contoh: budi@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">No. WhatsApp (Opsional)</label>
                  <input 
                    type="tel" 
                    value={userData.whatsapp}
                    onChange={(e) => setUserData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <span>Mulai Tes MBTI</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: QUIZ / TEST QUESTIONNAIRE ================= */}
        {step === 'test' && (
          <div className="max-w-3xl mx-auto w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Header progress bar */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold uppercase bg-slate-700 text-indigo-300 px-3 py-1 rounded-full border border-slate-600">
                SOAL {currentQIndex + 1} DARI {questions.length}
              </span>
              <span className="text-sm font-medium text-slate-400">
                {Math.round(((currentQIndex) / questions.length) * 100)}% Selesai
              </span>
            </div>

            {/* Progress bar visual */}
            <div className="w-full h-2 bg-slate-900 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Area Soal Aktif */}
            <div className="min-h-[140px] flex items-center justify-center text-center my-6">
              <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed px-4">
                "{questions[currentQIndex].text}"
              </p>
            </div>

            {/* Skala Jawaban Likert (Pilihan Bulat Cantik) */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:space-x-4 space-y-4 md:space-y-0">
                <span className="text-xs font-bold text-emerald-400 tracking-wider">SANGAT SETUJU</span>
                
                <div className="flex items-center space-x-3 md:space-x-4">
                  {/* Sangat Setuju (+2) */}
                  <button 
                    onClick={() => handleAnswerSelect(2)}
                    className="w-14 h-14 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-2 border-emerald-500/40 flex items-center justify-center font-bold text-lg transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    +2
                  </button>

                  {/* Setuju (+1) */}
                  <button 
                    onClick={() => handleAnswerSelect(1)}
                    className="w-12 h-12 rounded-full bg-emerald-500/5 hover:bg-emerald-500/80 text-emerald-300 hover:text-white border-2 border-emerald-500/20 flex items-center justify-center font-bold text-base transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    +1
                  </button>

                  {/* Netral (0) */}
                  <button 
                    onClick={() => handleAnswerSelect(0)}
                    className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 border-2 border-slate-600 flex items-center justify-center font-bold text-sm transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    0
                  </button>

                  {/* Kurang Setuju (-1) */}
                  <button 
                    onClick={() => handleAnswerSelect(-1)}
                    className="w-12 h-12 rounded-full bg-rose-500/5 hover:bg-rose-500/80 text-rose-300 hover:text-white border-2 border-rose-500/20 flex items-center justify-center font-bold text-base transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    -1
                  </button>

                  {/* Sangat Tidak Setuju (-2) */}
                  <button 
                    onClick={() => handleAnswerSelect(-2)}
                    className="w-14 h-14 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border-2 border-rose-500/40 flex items-center justify-center font-bold text-lg transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    -2
                  </button>
                </div>

                <span className="text-xs font-bold text-rose-400 tracking-wider">SANGAT TIDAK SETUJU</span>
              </div>

              {/* Navigasi Manual Bawah */}
              <div className="flex justify-between items-center border-t border-slate-700/60 pt-6 mt-8">
                <button 
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Kembali</span>
                </button>

                <div className="text-xs text-slate-500">
                  Data langsung disimpan ke sistem pusat setelah soal terakhir.
                </div>

                {currentQIndex === questions.length - 1 ? (
                  <button 
                    disabled={Object.keys(answers).length < questions.length || isSubmitting}
                    onClick={calculateResult}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm tracking-wide shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Memproses...' : 'Lihat Hasil'}
                    <CheckCircle size={16} />
                  </button>
                ) : (
                  <button 
                    disabled={answers[questions[currentQIndex].id] === undefined}
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: RESULT DISPLAY (COMPREHENSIVE 16 MBTI) ================= */}
        {step === 'result' && resultMBTI && mbtiDetails[resultMBTI] && (
          <div className="max-w-4xl mx-auto w-full space-y-6 py-4">
            {/* Kartu Selamat & MBTI Utama */}
            <div className="bg-slate-800 border-2 border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left space-y-2">
                  <span className="text-xs font-bold uppercase bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
                    ANALISIS KEPRIBADIAN SELESAI
                  </span>
                  <p className="text-slate-400 text-sm mt-2">Terima kasih <span className="font-semibold text-white">{userData.name}</span>, tipe kepribadian Anda adalah:</p>
                  <h2 className="text-5xl md:text-6xl font-extrabold text-indigo-400 tracking-wider">
                    {resultMBTI}
                  </h2>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    Sang {mbtiDetails[resultMBTI].title}
                  </h3>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full md:w-80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skor Dimensi Anda:</h4>
                  
                  {/* EI Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Extraversion ({scorePercentages.EI}%)</span>
                      <span className="text-slate-300">Introversion ({100 - scorePercentages.EI}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-indigo-500" style={{ width: `${scorePercentages.EI}%` }}></div>
                      <div className="h-full bg-purple-500" style={{ width: `${100 - scorePercentages.EI}%` }}></div>
                    </div>
                  </div>

                  {/* SN Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Sensing ({scorePercentages.SN}%)</span>
                      <span className="text-slate-300">Intuition ({100 - scorePercentages.SN}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-indigo-500" style={{ width: `${scorePercentages.SN}%` }}></div>
                      <div className="h-full bg-purple-500" style={{ width: `${100 - scorePercentages.SN}%` }}></div>
                    </div>
                  </div>

                  {/* TF Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Thinking ({scorePercentages.TF}%)</span>
                      <span className="text-slate-300">Feeling ({100 - scorePercentages.TF}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-indigo-500" style={{ width: `${scorePercentages.TF}%` }}></div>
                      <div className="h-full bg-purple-500" style={{ width: `${100 - scorePercentages.TF}%` }}></div>
                    </div>
                  </div>

                  {/* JP Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Judging ({scorePercentages.JP}%)</span>
                      <span className="text-slate-300">Perceiving ({100 - scorePercentages.JP}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-indigo-500" style={{ width: `${scorePercentages.JP}%` }}></div>
                      <div className="h-full bg-purple-500" style={{ width: `${100 - scorePercentages.JP}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Konten Penjelasan Rinci */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deskripsi & Kekuatan */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center">
                  <BookOpen size={20} className="text-indigo-400 mr-2" />
                  Deskripsi Kepribadian
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {mbtiDetails[resultMBTI].desc}
                </p>

                <h4 className="text-lg font-bold text-white flex items-center pt-2">
                  <Award size={20} className="text-emerald-400 mr-2" />
                  Kelebihan Utama
                </h4>
                <ul className="grid grid-cols-2 gap-2 text-xs">
                  {mbtiDetails[resultMBTI].strengths.map((st, i) => (
                    <li key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2 rounded-lg flex items-center">
                      <CheckCircle size={12} className="mr-1.5 flex-shrink-0 text-emerald-400" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Karir & Kelemahan */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center">
                  <Briefcase size={20} className="text-amber-400 mr-2" />
                  Rekomendasi Karir
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mbtiDetails[resultMBTI].careers.map((car, i) => (
                    <span key={i} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-medium">
                      {car}
                    </span>
                  ))}
                </div>

                <h4 className="text-lg font-bold text-white flex items-center pt-2">
                  <Layers size={20} className="text-rose-400 mr-2" />
                  Kelemahan / Tantangan
                </h4>
                <ul className="space-y-2 text-xs">
                  {mbtiDetails[resultMBTI].weaknesses.map((we, i) => (
                    <li key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-lg flex items-center">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2"></span>
                      <span>{we}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Aksi Hasil */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                <span className="font-semibold text-indigo-400">Pemberitahuan:</span> Hasil Anda telah tersinkronkan ke basis data cloud admin kami.
              </div>
              <div className="flex space-x-3 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => setStep('welcome')}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Ulangi Tes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: ADMIN GATE / PANEL ================= */}
        {step === 'admin' && (
          <div className="max-w-5xl mx-auto w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8">
            
            {/* LOGIN GATE */}
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto text-center space-y-6 py-8">
                <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-slate-700">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Dasbor Administrasi</h3>
                  <p className="text-sm text-slate-400 mt-1">Gunakan password bawaan untuk mengakses data dan mengekspor ke Excel.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="text-left">
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Kata Sandi Admin</label>
                    <input 
                      type="password" 
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan Password Admin"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {adminError && <p className="text-xs text-rose-400 mt-2 font-medium">{adminError}</p>}
                    <p className="text-[10px] text-slate-500 mt-2 bg-slate-900 p-2 rounded border border-slate-700/50">
                      * Demo Password: <span className="font-mono text-indigo-400">adminmbti123</span>
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Masuk ke Dasbor</span>
                    <ShieldCheck size={18} />
                  </button>
                </form>
              </div>
            ) : (
              // ADMIN DASHBOARD & EXCEL SINKRONISASI
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <h3 className="text-2xl font-extrabold text-white">Data Pengujian Sinkron</h3>
                    </div>
                    <p className="text-sm text-slate-400">Total {savedSubmissions.length} respon terdaftar secara real-time dari Firestore.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button 
                      onClick={exportToExcel}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                      <span>Ekspor ke Excel (CSV)</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsAdminLoggedIn(false);
                        setAdminPassword('');
                      }}
                      className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                    >
                      Keluar
                    </button>
                  </div>
                </div>

                {/* TABEL RESPONDEN */}
                {savedSubmissions.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-700/50">
                    <Database size={40} className="text-slate-600 mx-auto mb-3" />
                    <h4 className="text-white font-bold">Basis Data Masih Kosong</h4>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Selesaikan tes setidaknya satu kali untuk menampilkan data terdaftar di sini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                          <th className="py-3 px-4">Nama Responden</th>
                          <th className="py-3 px-4">Kontak (Email / WA)</th>
                          <th className="py-3 px-4 text-center">Hasil MBTI</th>
                          <th className="py-3 px-4 text-center">E/I - S/N - T/F - J/P</th>
                          <th className="py-3 px-4 text-right">Waktu Sinkron</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                        {savedSubmissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">{sub.name}</td>
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="text-xs text-slate-300">{sub.email}</div>
                              {sub.whatsapp && sub.whatsapp !== '-' && (
                                <div className="text-[11px] text-indigo-400 font-mono">WA: {sub.whatsapp}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 px-2.5 py-1 rounded-lg text-sm">
                                {sub.mbti}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-xs">
                              <div className="flex justify-center space-x-2 text-[11px] text-slate-400">
                                <span>E:{sub.percentages?.E}% / I:{sub.percentages?.I}%</span>
                                <span>•</span>
                                <span>S:{sub.percentages?.S}% / N:{sub.percentages?.N}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">
                              {sub.formattedDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 MBTI Sync Pro. Dilengkapi dengan Cloud Database Real-time & Sistem Ekspor Excel Mandiri.</p>
          <div className="flex justify-center space-x-4 text-[11px] text-indigo-400/80">
            <span>Server Aktif</span>
            <span>•</span>
            <span>Enkripsi Database Aman</span>
            <span>•</span>
            <span>Bebas Digunakan Secara Umum</span>
          </div>
        </div>
      </footer>
    </div>
  );
}