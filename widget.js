const chatWidget = document.createElement('div');
chatWidget.innerHTML = `
  <style>
    #chatbox {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 600px; /* الارتفاع الأقصى عند الفتح */
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: 'Inter', Arial, sans-serif;
      z-index: 9999;
      overflow: hidden; /* إخفاء المحتوى الزائد عند الطي */
      display: flex;
      flex-direction: column;
      transition: max-height 0.3s ease-out, box-shadow 0.3s ease-out; /* حركة سلسة للطي/الفتح */
    }

    /* حالة الودجت المطوي */
    #chatbox.collapsed {
      max-height: 50px; /* ارتفاع صغير عند الطي (فقط للرأس) */
      box-shadow: 0 1px 5px rgba(0,0,0,0.15); /* ظل أخف عند الطي */
    }

    #chatbox-header {
      background: #007b83;
      color: white;
      padding: 10px;
      font-weight: bold;
      border-top-left-radius: 9px;
      border-top-right-radius: 9px;
      cursor: pointer; /* للإشارة إلى أنه قابل للنقر */
      display: flex;
      justify-content: space-between; /* لتوزيع العنوان والأيقونة */
      align-items: center;
      user-select: none; /* منع تحديد النص عند النقر */
    }

    #chatbox-header-title {
      flex-grow: 1; /* لجعل العنوان يملأ المساحة المتاحة */
    }

    #chatbox-toggle-icon {
      font-size: 1.2rem;
      transition: transform 0.3s ease; /* حركة سلسة للأيقونة */
    }

    #chatbox.collapsed #chatbox-toggle-icon {
      transform: rotate(180deg); /* تدوير السهم عند الطي */
    }

    #chatbox-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
      font-size: 0.9rem;
      background-color: #f0f0f0;
      min-height: 400px; /* تم إضافة هذا لجعل الودجت أكبر عند البداية */
      /* عند الطي، يجب إخفاء الرسائل */
      display: flex; /* لضمان التنسيق الصحيح */
      flex-direction: column;
    }

    #chatbox.collapsed #chatbox-messages,
    #chatbox.collapsed #chatbox-input {
        display: none; /* إخفاء محتوى الرسائل وحقل الإدخال عند الطي */
    }

    .message-bubble {
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 15px;
      max-width: 80%;
      word-wrap: break-word;
      direction: rtl; /* محاذاة النص داخل الفقاعة من اليمين لليسار */
      display: flex; /* استخدام فليكس بوكس لتنسيق العناصر الداخلية */
      flex-direction: column; /* ترتيب العناصر عمودياً (اسم ثم محتوى) */
      align-items: flex-end; /* محاذاة المحتوى لليمين داخل الفقاعة */
    }
    .user-message {
      background-color: #dcf8c6;
      align-self: flex-end; /* محاذاة الفقاعة نفسها لليمين */
      margin-left: auto;
    }
    .bot-message {
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      align-self: flex-start; /* محاذاة الفقاعة نفسها لليسار (حسب التصميم) */
      margin-right: auto;
    }
    .sender-prefix {
      font-weight: bold;
      white-space: nowrap; /* منع انقسام الاسم والنقطتين */
      display: block; /* لجعل الاسم يأخذ سطرًا خاصًا */
      margin-bottom: 4px; /* مسافة بين اسم المرسل ومحتوى الرسالة */
      width: 100%; /* لضمان أنه يأخذ العرض الكامل داخل الفقاعة */
      text-align: right; /* محاذاة النص داخل اسم المرسل لليمين */
    }
    .sender-user {
      color: #0056b3;
    }
    .sender-bot {
      color: #007b83;
    }
    .message-content {
      flex-grow: 1; /* لجعل محتوى الرسالة يملأ المساحة المتبقية */
      text-align: right; /* محاذاة نص المحتوى لليمين */
      width: 100%; /* لضمان أنه يأخذ العرض الكامل داخل الفقاعة */
    }

    #chatbox-input {
      display: flex;
      border-top: 1px solid #ccc;
      background-color: #fff;
      border-bottom-left-radius: 9px;
      border-bottom-right-radius: 9px;
    }
    #userInput {
      flex: 1;
      padding: 10px;
      border: none;
      outline: none;
      border-bottom-left-radius: 9px;
      text-align: right; /* محاذاة النص المدخل والنص النائب لليمين */
      direction: rtl; /* اتجاه النص من اليمين لليسار */
    }
    #chatbox-input button {
      background: #007b83;
      color: white;
      border: none;
      padding: 0 15px;
      cursor: pointer;
      font-size: 1.2rem;
      border-bottom-right-radius: 9px;
      transition: background-color 0.2s ease;
    }
    #chatbox-input button:hover {
      background-color: #005f6b;
    }

    /* تصميم رمز التحميل (Spinner) */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      border-top-color: #007b83; /* لون مطابق لرأس الودجت */
      animation: spin 1s ease-in-out infinite;
      -webkit-animation: spin 1s ease-in-out infinite;
      vertical-align: middle; /* محاذاة عمودية مع النص */
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }

    /* تصميم متجاوب (Responsive Design) */
    @media (max-width: 600px) {
      #chatbox {
        width: 90%;
        right: 5%;
        left: 5%;
        bottom: 10px;
        max-height: 90vh; /* تم زيادة الارتفاع على الجوال لجعله أكبر */
      }
      #chatbox.collapsed {
        max-height: 50px; /* يحافظ على الارتفاع عند الطي على الجوال */
      }
      #chatbox-messages {
        min-height: 60vh; /* تحديد min-height أكبر على الجوال */
      }
    }
  </style>
  <div id="chatbox">
    <div id="chatbox-header">
      <span id="chatbox-header-title">SmileCare Assistant 🤖</span>
      <span id="chatbox-toggle-icon">▼</span>
    </div>
    <div id="chatbox-messages"></div>
    <div id="chatbox-input">
      <input type="text" id="userInput" placeholder="اسألني أي حاجة..." />
      <button id="sendButton">➤</button>
    </div>
  </div>
`;

document.body.appendChild(chatWidget);

// الحصول على العناصر بعد إضافتها إلى DOM
const chatbox = document.getElementById('chatbox');
const chatboxHeader = document.getElementById('chatbox-header');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');


// Replace with your actual APP_API_KEY from Vercel
const API_KEY = "aibot"; // 




// إضافة مستمع حدث الضغط على زر Enter لحقل الإدخال
userInput.addEventListener('keypress', function(event) {
  // keyCode 13 هو مفتاح Enter
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// إضافة مستمع حدث النقر لزر الإرسال
sendButton.addEventListener('click', sendMessage);

// إضافة مستمع حدث النقر لرأس الدردشة لطي/فتح الودجت
chatboxHeader.addEventListener('click', function() {
  chatbox.classList.toggle('collapsed');
  // إذا تم فتح الودجت، قم بالتمرير لأسفل لآخر رسالة
  if (!chatbox.classList.contains('collapsed')) {
    const chatMessages = document.getElementById('chatbox-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});


async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return; // لا تفعل شيئًا إذا كانت الرسالة فارغة

  // إذا كان الودجت مطوياً، قم بفتحه أولاً
  if (chatbox.classList.contains('collapsed')) {
    chatbox.classList.remove('collapsed');
  }

  appendMessage('أنت', message, 'user');
  userInput.value = ''; // مسح حقل الإدخال
  userInput.focus(); // إعادة التركيز على حقل الإدخال

  // إضافة رسالة تحميل مؤقتة (الآن مع رمز تحميل)
  const loadingMessageId = 'loading-' + Date.now();
  appendMessage('SmileCare', '<div class="loading-spinner"></div>', 'bot', loadingMessageId, true); // `true` للإشارة إلى أن النص هو HTML

  try {
    const response = await fetch('https://test-widget-git-main-majednans-projects.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' , 'X-API-Key': API_KEY}, // Add your API key here
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // إزالة رسالة التحميل وتحديثها بالاستجابة الفعلية
    updateMessage(loadingMessageId, 'SmileCare', data.reply || 'حصلت مشكلة، حاول تاني.');

  } catch (error) {
    console.error('Error sending message:', error);
    updateMessage(loadingMessageId, 'SmileCare', 'آسف، حصلت مشكلة في الاتصال. يرجى المحاولة مرة أخرى.');
  }
}

// تم تعديل الدالة لتقبل HTML في النص ولإنشاء هيكل الرسالة الجديد
function appendMessage(sender, text, type, messageId = null, isHtml = false) {
  const chatMessages = document.getElementById('chatbox-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-bubble ${type}-message`;
  if (messageId) {
    messageDiv.id = messageId; // تعيين ID لرسائل التحميل
  }

  // إنشاء اسم المرسل مع النقطتين
  const senderPrefixSpan = document.createElement('span');
  senderPrefixSpan.className = `sender-prefix sender-${type}`;
  senderPrefixSpan.textContent = `${sender}: `; // إضافة النقطتين والمسافة هنا
  messageDiv.appendChild(senderPrefixSpan);

  // إنشاء حاوية لمحتوى الرسالة الفعلي (نص أو HTML)
  const messageContentSpan = document.createElement('span');
  messageContentSpan.className = 'message-content';

  if (isHtml) {
    messageContentSpan.innerHTML = text; // استخدام innerHTML لرمز التحميل
  } else {
    messageContentSpan.textContent = text; // النص العادي
  }
  
  messageDiv.appendChild(messageContentSpan);
  chatMessages.appendChild(messageDiv);

  // التمرير لأسفل تلقائيا لعرض أحدث الرسائل
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// تم تعديل الدالة لتحديث محتوى الرسالة فقط
function updateMessage(messageId, sender, newText) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    // تحديث اسم المرسل في sender-prefix إذا لزم الأمر (لمنع أي تغييرات غير متوقعة)
    const senderPrefixSpan = messageDiv.querySelector('.sender-prefix');
    if (senderPrefixSpan) {
        senderPrefixSpan.textContent = `${sender}: `; // تحديث النص بالاسم والنقطتين
    }

    // العثور على حاوية محتوى الرسالة وتحديث نصها
    const messageContentSpan = messageDiv.querySelector('.message-content');
    if (messageContentSpan) {
        messageContentSpan.textContent = newText;
    }
  }
  const chatMessages = document.getElementById('chatbox-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
