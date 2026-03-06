require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  REST,
  Routes,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Events,
  ButtonBuilder,
  ButtonStyle,
  Partials,
  PermissionsBitField
} = require("discord.js");
/* ======= kết hôn ==== */

/* ======= adn */

const { status } = require("minecraft-server-util");


/* =============== CLIENT =============== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const PREFIX = "";
let lastStatus = null;

// 📊 Đếm số tin nhắn mỗi user trong server
const messageCount = new Map();

// 🤖 KIẾN THỨC AI NPC SERVER //
const tarotDeck = [
{
name:"The Fool",
meaning:"Khởi đầu mới, hành trình mới. Lá bài này cho thấy bạn đang đứng trước một bước ngoặt lớn. Đôi khi cần liều lĩnh để đạt được điều mình mong muốn."
},

{
name:"The Magician",
meaning:"Sức mạnh và khả năng biến ý tưởng thành hiện thực. Nếu bạn tin vào bản thân, bạn có thể đạt được điều mình mong muốn."
},

{
name:"The High Priestess",
meaning:"Trực giác và bí mật. Có thể câu trả lời bạn tìm kiếm đã nằm sẵn trong tâm trí bạn."
},

{
name:"The Empress",
meaning:"Sự sinh sôi, tình yêu và phát triển. Điều bạn mong muốn có thể sẽ phát triển theo hướng tích cực."
},

{
name:"The Emperor",
meaning:"Quyền lực và kiểm soát. Bạn cần kiểm soát tình hình thay vì để nó kiểm soát bạn."
},

{
name:"The Hierophant",
meaning:"Truyền thống và lời khuyên từ người có kinh nghiệm. Hãy lắng nghe những người đi trước."
},

{
name:"The Lovers",
meaning:"Tình yêu và sự lựa chọn quan trọng. Lá bài này thường liên quan đến các quyết định cảm xúc."
},

{
name:"The Chariot",
meaning:"Chiến thắng nhờ ý chí mạnh mẽ. Nếu bạn kiên trì, bạn sẽ đạt được điều mong muốn."
},

{
name:"Strength",
meaning:"Sức mạnh nội tâm. Sự kiên nhẫn và lòng can đảm sẽ giúp bạn vượt qua thử thách."
},

{
name:"The Hermit",
meaning:"Thời gian suy ngẫm. Có thể bạn cần ở một mình để hiểu rõ bản thân."
},

{
name:"Wheel of Fortune",
meaning:"Vận mệnh thay đổi. Những điều bất ngờ có thể xảy ra."
},

{
name:"Justice",
meaning:"Sự công bằng và cân bằng. Quyết định đúng đắn sẽ dẫn bạn đến kết quả tốt."
},

{
name:"The Hanged Man",
meaning:"Hy sinh và góc nhìn mới. Đôi khi phải chấp nhận chậm lại để hiểu rõ hơn."
},

{
name:"Death",
meaning:"Kết thúc để bắt đầu mới. Một giai đoạn cũ đang kết thúc."
},

{
name:"Temperance",
meaning:"Sự cân bằng và hòa hợp. Hãy kiên nhẫn với quá trình."
},

{
name:"The Devil",
meaning:"Sự ràng buộc hoặc cám dỗ. Có điều gì đó đang giữ bạn lại."
},

{
name:"The Tower",
meaning:"Biến cố bất ngờ. Một sự thật lớn có thể sắp được hé lộ."
},

{
name:"The Star",
meaning:"Hy vọng và chữa lành. Đây là dấu hiệu tích cực."
},

{
name:"The Moon",
meaning:"Sự mơ hồ và nghi ngờ. Có thể bạn chưa thấy toàn bộ sự thật."
},

{
name:"The Sun",
meaning:"Niềm vui, thành công và năng lượng tích cực."
},

{
name:"Judgement",
meaning:"Thức tỉnh và nhận ra con đường thật sự của mình."
},

{
name:"The World",
meaning:"Hoàn thành và đạt được mục tiêu."
},

/* ===== MINOR ARCANA ===== */

{
name:"Ace of Cups",
meaning:"Khởi đầu của tình yêu hoặc cảm xúc mới."
},

{
name:"Two of Cups",
meaning:"Sự kết nối mạnh mẽ giữa hai người."
},

{
name:"Three of Cups",
meaning:"Niềm vui, tình bạn và sự ăn mừng."
},

{
name:"Four of Cups",
meaning:"Sự chán nản hoặc bỏ lỡ cơ hội."
},

{
name:"Five of Cups",
meaning:"Thất vọng nhưng vẫn còn hy vọng."
},

{
name:"Six of Cups",
meaning:"Kỷ niệm và quá khứ quay trở lại."
},

{
name:"Seven of Cups",
meaning:"Nhiều lựa chọn khiến bạn bối rối."
},

{
name:"Eight of Cups",
meaning:"Rời bỏ điều không còn phù hợp."
},

{
name:"Nine of Cups",
meaning:"Điều ước có thể trở thành sự thật."
},

{
name:"Ten of Cups",
meaning:"Hạnh phúc và sự viên mãn."
},

{
name:"Page of Cups",
meaning:"Tin nhắn hoặc cảm xúc mới."
},

{
name:"Knight of Cups",
meaning:"Sự lãng mạn và hành động theo cảm xúc."
},

{
name:"Queen of Cups",
meaning:"Trực giác mạnh và lòng trắc ẩn."
},

{
name:"King of Cups",
meaning:"Kiểm soát cảm xúc và sự trưởng thành."
},

/* SWORDS */

{
name:"Ace of Swords",
meaning:"Sự thật và ý tưởng mới."
},

{
name:"Two of Swords",
meaning:"Sự do dự giữa hai lựa chọn."
},

{
name:"Three of Swords",
meaning:"Nỗi đau hoặc thất tình."
},

{
name:"Four of Swords",
meaning:"Nghỉ ngơi và hồi phục."
},

{
name:"Five of Swords",
meaning:"Xung đột hoặc chiến thắng không trọn vẹn."
},

{
name:"Six of Swords",
meaning:"Rời khỏi khó khăn."
},

{
name:"Seven of Swords",
meaning:"Sự lừa dối hoặc bí mật."
},

{
name:"Eight of Swords",
meaning:"Cảm giác bị mắc kẹt."
},

{
name:"Nine of Swords",
meaning:"Lo lắng và suy nghĩ tiêu cực."
},

{
name:"Ten of Swords",
meaning:"Kết thúc đau đớn nhưng cần thiết."
},

{
name:"Page of Swords",
meaning:"Sự tò mò và học hỏi."
},

{
name:"Knight of Swords",
meaning:"Hành động nhanh và quyết đoán."
},

{
name:"Queen of Swords",
meaning:"Sự thông minh và độc lập."
},

{
name:"King of Swords",
meaning:"Lý trí và quyền lực trí tuệ."
}

]


// 🔐 Cấu hình role permissions
const ALLOWED_ROLE_IDS = process.env.ALLOWED_ROLE_IDS 
  ? process.env.ALLOWED_ROLE_IDS.split(',') 
  : (process.env.ALLOWED_ROLE_ID ? [process.env.ALLOWED_ROLE_ID] : []);
const REQUIRE_ADMIN_FOR_GUI = process.env.REQUIRE_ADMIN_FOR_GUI === "true";

// 🔧 Hàm kiểm tra quyền dùng !gui
function hasGuiPermission(member) {
  // Nếu cấu hình chỉ Admin mới dùng được
  if (REQUIRE_ADMIN_FOR_GUI) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator);
  }
  
  // Admin luôn có quyền
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }
  
  // Kiểm tra role
  if (ALLOWED_ROLE_IDS.length > 0) {
    return ALLOWED_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
  }
  
  // Nếu không cấu hình role, mặc định là Admin only
  return false;
}

/* ================= SLASH COMMAND REGISTER ================= */
const commands = [
  {
    name: "online",
    description: "Xem trạng thái server Minecraft"
  },
  {
    name: "thanhtoan",
    description: "Hiển thị thông tin thanh toán + mã QR"
  },
  {
    name: "gui",
    description: `Mở form gửi tin nhắn vào kênh ${REQUIRE_ADMIN_FOR_GUI ? '(Admin only)' : '(Role restricted)'}`
  },
  {
    name: "help",
    description: "Xem tất cả lệnh của bot"
  },
  {
    name: "ping",
    description: "Kiểm tra độ trễ của bot"
  },
  {
    name: "info",
    description: "Thông tin về bot"
  },
  {
    name:"vote",
    description:"Tạo vote mới"
  },
  {
    name: "votedeptrai",
    description: "Vote độ đẹp trai của một người",
    options:[
  {
    name:"user",
    description:"Người cần vote",
    type:6,
    required:true
  }
  ]
  },
  {
    name: "tarot",
    description: "Bói tarot",
    options: [
      {
        name: "mongmuon",
        description: "Điều bạn muốn biết",
        type: 3,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands đã đăng ký");
    console.log(`🔐 Cấu hìnhh quyền !gui: ${REQUIRE_ADMIN_FOR_GUI ? 'Chỉ Admin' : 'Theo Role'}`);
    if (ALLOWED_ROLE_IDS.length > 0) {
      console.log(`👥 Role được phép: ${ALLOWED_ROLE_IDS.length} role`);
    }
  } catch (err) {
    console.error("❌ Lỗi đăng ký slash:", err);
  }
})();

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
  console.log(`📊 Đang phục vụ ${client.guilds.cache.size} server`);
  
  client.user.setActivity({
    name: "YumMC Server",
    type: ActivityType.Watching
  });
  
  checkServer();
  setInterval(checkServer, Number(process.env.CHECK_INTERVAL) || 15000);
});

/* ================= AUTO CHECK SERVER ================= */
async function checkServer() {
  const channel = await client.channels
    .fetch(process.env.ALERT_CHANNEL_ID)
    .catch(() => null);
  if (!channel) return;

  try {
    const res = await status(
      process.env.MC_IP,
      Number(process.env.MC_PORT)
    );

    client.user.setActivity(
      `Online: ${res.players.online}/${res.players.max}`,
      { type: ActivityType.Playing }
    );

    if (lastStatus !== "online") {
      lastStatus = "online";

      const embed = new EmbedBuilder()
        .setColor("#00ff99")
        .setTitle("🟢 SERVER ĐÃ ONLINE")
        .setImage(process.env.SERVER_BANNER)
        .addFields(
          { name: "🌍 Server", value: process.env.MC_IP },
          { name: "🌍 Port", value: process.env.MC_PORT },
          {
            name: "👥 Online",
            value: `${res.players.online}/${res.players.max}`,
            inline: true
          },
          {
            name: "⚙️ Version",
            value: res.version.name,
            inline: true
          }
        )
        .setTimestamp();
    }
  } catch {
    client.user.setActivity("Server OFFLINE", {
      type: ActivityType.Watching
    });

    if (lastStatus !== "offline") {
      lastStatus = "offline";

      const embed = new EmbedBuilder()
        .setColor("#ff3333")
        .setTitle("🔴 SERVER ĐÃ OFFLINE")
        .setDescription("Không thể kết nối tới server Minecraft")
        .setImage(process.env.SERVER_BANNER)
        .setTimestamp();
    }
  }
}

/* ================= MODAL GỬI TIN NHẮN ================= */
async function handleOpenModal(interaction) {
  try {
    // 🔐 KIỂM TRA QUYỀN THEO ROLE
    if (!hasGuiPermission(interaction.member)) {
      let errorMessage = "❌ Bạn không có quyền sử dụng tính năng này!";
      
      if (REQUIRE_ADMIN_FOR_GUI) {
        errorMessage = "❌ Bạn cần quyền **Admin** để sử dụng tính năng này!";
      } else if (ALLOWED_ROLE_IDS.length > 0) {
        // Lấy tên các role được phép
        const allowedRoles = ALLOWED_ROLE_IDS
          .map(id => interaction.guild.roles.cache.get(id)?.name || `Role(${id})`)
          .filter(name => name)
          .join(', ');
        
        errorMessage = `❌ Bạn cần có một trong các role sau: **${allowedRoles}**`;
      }
      
      return interaction.reply({
        content: errorMessage,
        ephemeral: true
      });
    }
    
    const modal = new ModalBuilder()
      .setCustomId('sendMessageModal')
      .setTitle(REQUIRE_ADMIN_FOR_GUI ? '✏️ Soạn Tin Nhắn (Admin)' : '✏️ Soạn Tin Nhắn');
    
    const messageInput = new TextInputBuilder()
      .setCustomId('messageContent')
      .setLabel('Nội dung tin nhắn')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Nhập tin nhắn bạn muốn gửi vào kênh này...')
      .setMaxLength(2000)
      .setRequired(true)
      .setMinLength(1);
    
    const titleInput = new TextInputBuilder()
      .setCustomId('messageTitle')
      .setLabel('Tiêu đề (tùy chọn)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Nhập tiêu đề nếu muốn...')
      .setMaxLength(100)
      .setRequired(false);
    
    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    const secondActionRow = new ActionRowBuilder().addComponents(titleInput);
    
    modal.addComponents(firstActionRow, secondActionRow);
    
    await interaction.showModal(modal);
    
  } catch (error) {
    console.error('Lỗi khi mở modal:', error);
    await interaction.reply({
      content: '❌ Không thể mở form nhậpp liệu!',
      ephemeral: true
    });
  }
}

/* ================= XỬ LÝ MODAL SUBMIT ================= */
async function handleModalSubmit(interaction) {
  if (interaction.customId !== 'sendMessageModal') return;
  
  // 🔐 KIỂM TRA QUYỀN KHI SUBMIT
  if (!hasGuiPermission(interaction.member)) {
    return interaction.reply({
      content: "❌ Bạn không có quyền gửi tin nhắn!",
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  try {
    const messageContent = interaction.fields.getTextInputValue('messageContent');
    const messageTitle = interaction.fields.getTextInputValue('messageTitle');
    
    if (!messageContent || messageContent.trim() === '') {
      return await interaction.editReply({
        content: '❌ Tin nhắn không được để trống!',
        ephemeral: true
      });
    }
    
    // Xác định màu sắc và title dựa trên role
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const embedColor = isAdmin ? '#FF0000' : '#5865F2';
    const authorPrefix = isAdmin ? '📢 Thông báo từ Admin' : '💬 Tin nhắn từ';
    
    const messageEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setDescription(messageContent)
      .setTimestamp()
      .setFooter({ 
        text: `${authorPrefix} - ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }));
    
    if (messageTitle && messageTitle.trim() !== '') {
      messageEmbed.setTitle(`📌 ${messageTitle}`);
    } else {
      messageEmbed.setTitle(isAdmin ? `📢 THÔNG BÁO QUAN TRỌNG` : `💬 TIN NHẮN MỚI`);
    }
    
    const sentMessage = await interaction.channel.send({
      embeds: [messageEmbed]
    });
    
    // Reaction khác nhau cho Admin và Role
    await sentMessage.react(isAdmin ? '📢' : '💬');
    
    await interaction.editReply({
      content: `✅ Đã gửi tin nhắn thành công!`,
      ephemeral: true
    });
    
    console.log(`📨 ${isAdmin ? 'ADMIN' : 'ROLE'} ${interaction.user.tag} đã gửi tin nhắn tại #${interaction.channel.name}`);
    
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
    
    await interaction.editReply({
      content: '❌ Đã có lỗi khi gửi tin nhắn! Vui lòng thử lại.',
      ephemeral: true
    });
  }
}

/* ================= PREFIX COMMAND ================= */
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  
    // 📊 Tăng số tin nhắn user
    const userId = message.author.id;
    messageCount.set(userId, (messageCount.get(userId) || 0) + 1);
    
  
  
    // ===== ẢNH NÓNG KEYWORD =====
  if (message.content.toLowerCase().includes("ảnh nóng")) {
    const embed = new EmbedBuilder()
      .setColor("#ff3366")
      .setTitle("🔥 ẢNH NÓNG HOT NHẤT TUẦN 🔥")
      .setDescription(
        "🚨 Cảnh báo: Nội dung cực kỳ nóng bỏng!\n\n" +
        "👉 Bộ ảnh này đã được hội FA kiểm duyệt gắt gao.\n" +
        "💘 Xem xong đảm bảo tim đập nhanh hơn TPS server.\n\n" +
        "📸 Tuyệt phẩm ngay bên dưới 👇"
      )
      .setImage(process.env.ANH_NONG_IMAGE)
      .setFooter({ text: "Nguồn: Hội Những Người Thích Drama" })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
  
    // ===== AUTO CHAT RANDOM =====

    const msg = message.content.toLowerCase();

// danh sách từ bỏ qua
    const ignore = [
    "ảnh nóng",
    "getid",
    "authme",
    "rank",
    "owner",
    "online",
    "help",
    "ping",
    "info",
    "ip",
    "ship",
    "kethon",
    "code",
    "iq",
    "gay",
    "hack",
    "gui"
    ];

    if (!ignore.some(word => msg.includes(word))) {

// random câu trả lời
    const replies = [
    "✨ Hôm nay bạn đẹp lắm!",
    "😆 Bạn nói chuyện dễ thương ghê",
    "👀 Tôi đang nghe đây",
    "🎮 Chúc bạn chơi game vui vẻ!",
    "🤖 Tôi là bot nhưng vẫn thích nói chuyện",
    "🔥 Server hôm nay đông ghê",
    "💬 Bạn cần giúp gì không?",
    "☕️ Cf gì chưa ng đẹp!",
    "🫣 Có người yêu chưa @@",
    "🪫 Hết pin r, cần một người để ôm!",
    "🌎 Thế giới 7 tỷ ng, nhưng định mệnh đã đưa chúng ta gặp nhau ở đây!",
    "🐧 Đẹp trai thế này mỗi tội chưa có ny",
    "👉🏿 Đồ ế, ế thâm niên, đỉnh cao của ế!",
    "👨🏻‍🔧 Cần sửa ống nước k người đẹp ơii",
    "😩 Chán thì làm gì, vào đây xem cho hết chán nè : http://javhd.com 😆",
    "🍚 Ăn gì chưa ní ơi, chưa thì dẫn tui đi ăn nè!",
    "😍 Ní nói chuyện đáng yêu dễ sợ",
    "😳 Nghe cũng hợp lý đấy",
    "🚀 YUMMC mãi đỉnh!",
    "🎉 Chúc bạn một ngày tốt lành!"
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];
     // random 40% để bot đỡ spam
    if (Math.random() < 0.4) {
        message.reply(randomReply);
    }
}

/* ====== abc =====*/
  
  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    /* ===== !getid ===== */
    if (cmd === "getid") {
      const user = message.mentions.users.first() || message.author;
      const msgCount = messageCount.get(user.id) || 0;
      
      const embed = new EmbedBuilder()
        .setColor("#ff5fa2")
        .setTitle("🆔 THÔNG TIN ID")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤 User", value: `<@${user.id}>`, inline: true },
          { name: "🏷️ Tag", value: user.username, inline: true },
          { name: "🆔 ID", value: user.id },
          { name: "💬 Tin nhắn", value: `${msgCount}`, inline: true }, // 👈 THÊM
          { name: "🤖 Bot", value: user.bot ? "Có" : "Không" },
          {
            name: "📆 Tạo",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`
          }
        )
        .setFooter({ text: "YumMC Bot" });

      return message.channel.send({ embeds: [embed] });
    }
    
    
   /* ====== !authme ==== */
if (cmd === "authme") {

  const todayCode = "vannit"; // 🔐 mã bảo mật hôm nay

  const authEmbed = new EmbedBuilder()
    .setColor('#E67E22')
    .setTitle('🔐 **XÁC THỰC TÀI KHOẢN** 🔐')
    .setDescription('✨ **Hệ thống bảo mật đăng nhập server** ✨')
    .setThumbnail('https://i.imgur.com/lock.png')
    .addFields(
      {
        name: ':diamond:━━━━━━━━━━━━━━━━━━━━━━━:diamond:',
        value: ' ',
        inline: false
      },
      {
        name: '🛡️ **MÃ BẢO MẬT HÔM NAY**',
        value:
          "```" +
          `Mã bảo mật của ngày hôm nay là:\n\n` +
          `🔑 ${todayCode}\n\n` +
          "```",
        inline: false
      },
      {
        name: '📌 **LƯU Ý**',
        value:
          "```" +
          `• Không chia sẻ mã này ra ngoài nhóm của sv\n` +
          `• Nhập mã này trong game để xác thực\n` +
          `• Mã sẽ thay đổi mỗi ngày\n` +
          `• Lấy mã ở đây, vào sv khi nó yêu cầu nhập mã bảo mật, bấm /authme mã` +
          "```",
        inline: false
      }
    );

  message.channel.send({ embeds: [authEmbed] });
}

/*==== tu tien ====*/
if (cmd === "tutien") {
const story = [

"🌌 **Đại Lục Thiên Huyền**...",
"Nơi cường giả vi tôn.",
"Kẻ yếu... chỉ có thể cúi đầu sống sót.",

"Trên đại lục này tồn tại vô số tông môn.",
"Thanh Vân Tông.",
"Huyền Kiếm Môn.",
"Thiên Ma Điện.",

"Những nơi đó... đều là thánh địa của tu sĩ.",

"🏡 Nhưng tại một ngôi làng nhỏ hẻo lánh...",
"Mọi thứ lại hoàn toàn khác.",

"Có một thiếu niên tên **haajun**.",

"Từ nhỏ hắn đã bị gọi là phế vật.",
"Không thể cảm nhận linh khí.",
"Không thể tu luyện.",

"Trong thế giới này...",
"Điều đó gần như đồng nghĩa với việc cả đời làm phàm nhân.",

"Nhưng Haajun không cam tâm.",

"Mỗi ngày hắn đều lên núi.",
"Luyện kiếm.",
"Rèn luyện thân thể.",

"Dù bị người khác chế giễu...",
"Hắn vẫn không bỏ cuộc.",

"🌙 Một đêm nọ...",

"Bầu trời đột nhiên tối sầm.",

"⚡ Một tia lôi đình khổng lồ xé toạc bầu trời.",

"Nó đánh thẳng xuống ngọn núi phía sau làng.",

"Cả ngọn núi rung chuyển.",

"Haajun nhìn thấy cảnh đó.",

"Hắn do dự một lúc...",

"Nhưng cuối cùng vẫn quyết định lên núi xem thử.",

"🌲 Khu rừng ban đêm yên tĩnh đến đáng sợ.",

"Gió thổi qua những tán cây.",

"Tạo ra âm thanh rợn người.",

"Haajun bước từng bước cẩn thận.",

"Cuối cùng hắn cũng tới nơi tia sét đánh xuống.",

"Trước mắt hắn là một cái hố lớn.",

"Khói vẫn còn bốc lên.",

"Trong đống đá vụn...",

"Một vật gì đó đang phát sáng.",

"Haajun tiến lại gần.",

"Đó là một **chiếc nhẫn cổ xưa**.",

"Trên bề mặt khắc đầy phù văn kỳ lạ.",

"Hắn đưa tay nhặt lên.",

"Ngay khi chạm vào chiếc nhẫn...",

"💥 Một luồng ký ức tràn vào đầu hắn.",

"Haajun đau đớn quỳ xuống đất.",

"Đầu hắn như muốn nổ tung.",

"Đột nhiên...",

"👤 Một giọng nói già nua vang lên trong đầu hắn.",

"'Thiếu niên... cuối cùng cũng có người tìm thấy ta.'",

"Haajun hoảng hốt.",

"'Ngươi là ai?!'",

"👤 'Ta là tàn hồn của một tu sĩ thượng cổ Lương Văn Bằng.'",

"'Ta đã ngủ say trong chiếc nhẫn này hàng ngàn năm.'",

"'Và hôm nay... ngươi đã đánh thức ta.'",

"Haajun run run hỏi:",

"'Ngươi... muốn gì ở ta?'",

"👤 Giọng nói khẽ cười.",

"'Ta không muốn gì cả.'",

"'Ta chỉ muốn tìm một người kế thừa.'",

"'Nếu ngươi đồng ý...'",

"'Ta có thể dạy ngươi **tu tiên**.'",

"Haajun chết lặng.",

"Tu tiên...",

"Thứ mà hắn luôn mơ ước.",

"Nhưng chưa từng dám nghĩ tới.",

"'Ta... thật sự có thể tu luyện sao?'",

"👤 Tàn hồn nói:",

"'Thiên phú của ngươi rất kém.'",

"'Nhưng ý chí của ngươi...'",

"'Lại mạnh hơn rất nhiều thiên tài.'",

"'Chỉ cần ngươi không bỏ cuộc...'",

"'Ta Lương Văn Bằng có thể giúp ngươi bước lên con đường cường giả.'",

"Gió đêm thổi qua khu rừng.",

"Haajun siết chặt chiếc nhẫn.",

"Ánh mắt hắn dần trở nên kiên định.",

"'Được...'",

"'Ta đồng ý!'",

"👤 Tàn hồn cười lớn.",

"'Tốt! Rất tốt!'",

"'Từ hôm nay...'",

"'Ta sẽ dạy ngươi **tu tiên**.'",

"🌠 Khoảnh khắc đó...",

"Số phận của Haajun bắt đầu thay đổi.",

"Và một truyền kỳ mới...",

"Đang dần được viết nên."

];

let delay = 0;

for (const line of story) {
  setTimeout(() => {
    message.channel.send(line);
  }, delay);
  delay += 2000;
}

}
    
    /* ===== !ship ===== */
if (cmd === "ship") {

  const user1 = message.mentions.users.first();
  const user2 = message.mentions.users.last();

  if (!user1 || !user2) {
    return message.reply("❌ Hãy tag 2 người để ghép đôi!\nVí dụ: `ship @A @B`");
  }

  const percent = Math.floor(Math.random() * 101);

  function bar(p) {
    const total = 10;
    const filled = Math.round(p / 10);
    return "█".repeat(filled) + "░".repeat(total - filled);
  }

  let msg = "";
  let heart = "💔";

  if (percent <= 10) {
    msg = "💀 Toang rồi, tránh xa nhau ra!";
    heart = "💀";
  } 
  else if (percent <= 30) {
    msg = "💔 Không hợp chút nào!";
    heart = "💔";
  } 
  else if (percent <= 50) {
    msg = "😅 Cũng tạm thôi...";
    heart = "🧡";
  } 
  else if (percent <= 70) {
    msg = "🙂 Có hi vọng đó!";
    heart = "❤️";
  } 
  else if (percent <= 90) {
    msg = "💖 Khá hợp luôn!";
    heart = "💖";
  } 
  else {
    msg = "💍 Trời sinh một cặp!";
    heart = "💞";
  }

  const embed = new EmbedBuilder()
    .setColor("#ff66cc")
    .setTitle("💘 Máy Ghép Đôi Tình Yêu")
    .setDescription(
`${user1} ${heart} ${user2}

📊 Tỉ lệ yêu nhau: **${percent}%**

\`${bar(percent)}\`

💬 ${msg}`
    )
    .setThumbnail(user1.displayAvatarURL({ dynamic: true }))
    .setImage(user2.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: "YumMC Love Machine ❤️" })
    .setTimestamp();

  return message.channel.send({ embeds: [embed] });
}

/* ===== test iq ==== */
if(cmd === "iq") {

const user = message.mentions.users.first() || message.author
const iq = Math.floor(Math.random() * 201)

let status = ""

if(iq < 40) status = "🐒 Khỉ còn thông minh hơn."
else if(iq < 80) status = "🙂 IQ hơi thấp nha."
else if(iq < 120) status = "🧠 Bình thường."
else if(iq < 160) status = "🤓 Rất thông minh."
else status = "👑 Thiên tài server."

const embed = {
color: 0x00ffff,
title: "🧠 Máy đo IQ siêu cấp",
description: `Đang quét não của **${user.username}**...`,
footer: { text: "Hệ thống đo IQ YUMMC" }
}

let msg = await message.channel.send({ embeds:[embed] })

setTimeout(() => {

msg.edit({
embeds:[{
color: 0x00ff99,
title: "🧠 Kết quả IQ",
description:
`👤 Người kiểm tra: ${user}

🧠 IQ: **${iq}**

${status}`,
footer:{ text:"Máy đo IQ hoạt động 99.9% chính xác" }
}]
})

},2000)

}

/* ====== test gay === */
if(cmd === "gay") {

const user = message.mentions.users.first() || message.author
const percent = Math.floor(Math.random() * 101)

let comment = ""

if(percent < 20) comment = "😎 Thẳng như cột điện."
else if(percent < 50) comment = "🙂 Có dấu hiệu nhẹ."
else if(percent < 80) comment = "🌈 Bắt đầu lộ rồi."
else comment = "💅 Chúa tể LGBT."

const embed = {
color: 0xff00aa,
title: "🌈 Máy đo Gay Server",
description:`Đang phân tích giới tính của **${user.username}**...`
}

let msg = await message.channel.send({embeds:[embed]})

setTimeout(()=>{

msg.edit({
embeds:[{
color:0xff00aa,
title:"🌈 Kết quả kiểm tra",
description:`
👤 Người kiểm tra: ${user}

🌈 Gay: **${percent}%**

${comment}
`
}]
})

},2000)

}


/* ===== test hack ==== */
if(cmd === "hack"){

let user = message.mentions.users.first()

if(!user)
return message.reply("Tag người cần hack 😈")

let msg = await message.channel.send("💻 Đang kết nối máy chủ hack...")

setTimeout(()=>{
msg.edit("💻 Đang lấy dữ liệu Discord...")
},2000)

setTimeout(()=>{
msg.edit("📂 Đang truy cập tin nhắn riêng...")
},4000)

setTimeout(()=>{
msg.edit("🔑 Đang crack mật khẩu...")
},6000)

setTimeout(()=>{

let password = Math.random().toString(36).slice(-8)

msg.edit({
embeds:[{
color:0xff0000,
title:"💀 Hack thành công",
description:`
👤 Target: ${user}

📧 Email: ${user.username}@gmail.com
🔑 Password: **${password}**

📂 Đã tải về 69GB dữ liệu

😈 Đã đánh cắp tất cả dữ liệu.
`
}]
})

},8000)

}
    
    /* ===== !rank ===== */
if (cmd === "rank") {

  const rankEmbed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setTitle('👑 **KHO BÁU RANK – ĐẶC QUYỀN SERVER** 👑')
    .setDescription('✨ **Danh sách rank hiện có & quyền lợi** ✨')
    .setThumbnail('https://i.imgur.com/crown.png')
    .addFields({
      name: '━━━━━━━━━━━━━━━━━━━━━━━',
      value: ' ',
      inline: false
    });

  const ranks = [
    {
      name: 'ĐÔN NẾT',
      emoji: '💵',
      description: 'Rank cơ bản dành cho người chơi ủng hộ server',
      benefits: [
        '+10% EXP',
        '+10% Money',
        'Dùng lệnh /fly'
      ],
      price: '20.000 VNĐ',
      status: '🟢 ACTIVE'
    },
    {
      name: 'VIP',
      emoji: '💎',
      description: 'Nâng cấp từ Đôn nết, nhiều tiện ích hơn',
      benefits: [
        '+10% EXP',
        '+10% Money',
        'Dùng lệnh /fly'
      ],
      price: '50.000 VNĐ',
      status: '🟢 ACTIVE'
    },
    {
      name: 'VIP+',
      emoji: '⚡',
      description: 'Nâng cấp từ VIP, nhiều tiện ích hơn',
      benefits: [
        '+20% EXP',
        '+20% Money',
        '/fly, /heal'
      ],
      price: '100.000 VNĐ',
      status: '🟢 ACTIVE'
    },
    {
      name: 'MVP',
      emoji: '👑',
      description: 'Rank cao cấp cho người chơi lâu dài',
      benefits: [ 
        '+30% EXP',
        '+30% Money',
        '/fly, /heal, /feed'
      ],
      price: '200.000 VNĐ',
      status: '🟢 ACTIVE'
    },
    {
      name: 'LEGEND',
      emoji: '🐉',
      description: 'Rank tối thượng – đặc quyền toàn server',
      benefits: [
        '+50% EXP',
        '+50% Money',
        'Toàn bộ lệnh đặc biệt'
      ],
      price: '300.000 VNĐ',
      status: '🟢 ACTIVE'
    }
  ];

  // 🔹 Render từng rank thành card có khung
  ranks.forEach(rank => {
    rankEmbed.addFields({
      name: `${rank.emoji} **${rank.name}** • ${rank.status}`,
      value:
        "```" +
        `${rank.description}\n\n` +
        rank.benefits.map(b => `➤ ${b}`).join('\n') +
        `\n\n💰 Giá: ${rank.price}` +
        "```",
      inline: false
    });
  });

  // 📊 Thống kê
  const activeRanks = ranks.filter(r => r.status.includes('🟢')).length;
  const inactiveRanks = ranks.length - activeRanks;

  rankEmbed.addFields(
    {
      name: '⭐━━━━━━━━━━━━━━━━━━━━━━━⭐',
      value: ' ',
      inline: false
    },
    {
      name: '📊 **QUYỀN LỢI ƯU ĐÃI**',
      value:
        "```" +
        `+ ${activeRanks} Cứ nạp mỗi 2K\n` +
        `- ${inactiveRanks} Được tặng 1 lồng Spawner tự chọn` +
        "```",
      inline: false
    }
  );

  message.channel.send({ embeds: [rankEmbed] });
}


    /* ===== !owner ===== */
    if (cmd === "owner") {
      const owner = await message.guild.members.fetch(process.env.OWNER_ID);

      const roles = owner.roles.cache
        .filter(r => r.id !== message.guild.id)
        .map(r => r.name)
        .join(", ");

      const joinTime = `<t:${Math.floor(owner.joinedTimestamp / 1000)}:R>`;

      const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("👑 CHỦ SỞ HỮU BOT")
        .setThumbnail(owner.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
`👑 **THÔNG TIN OWNER**
\`\`\`
Tên : ${owner.user.username}
ID  : ${owner.id}
Bot : Không
\`\`\`

📊 **Trên server này:**
• Nickname: ${owner.nickname || owner.user.username}
• Vào server: ${joinTime}
• Roles: ${roles}

**YumMC Bot**`
        );

      return message.channel.send({ embeds: [embed] });
    }

    /* ===== !online ===== */
    if (cmd === "online") {
      try {
        const res = await status(
          process.env.MC_IP,
          Number(process.env.MC_PORT)
        );

        const embed = new EmbedBuilder()
          .setColor("#00ff99")
          .setTitle("🟢 TRẠNG THÁI SERVER MINECRAFT")
          .setImage(process.env.SERVER_BANNER)
          .addFields(
            { name: "🌍 Server", value: process.env.MC_IP },
            { name: "🌍 Port", value: process.env.MC_PORT },
            {
              name: "👥 Online",
              value: `${res.players.online}/${res.players.max}`,
              inline: true
            },
            {
              name: "⚙️ Version",
              value: res.version.name,
              inline: true
            }
          )
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      } catch {
        return message.channel.send("❌ Server đang OFFLINE,Check Check cái lol!");
      }
    }

    /* ===== !help ===== */
    if (cmd === "help") {
      const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const hasGuiPerm = hasGuiPermission(message.member);
      
      const helpEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📖 Hướng Dẫn Sử Dụng Bot')
        .setDescription('Danh sách các lệnh có sẵn:')
        .addFields(
          { name: '🎮 **LỆNH MINECRAFT**', value: '────────────' },
          { name: '`/online` hoặc `online`', value: 'Xem trạng thái server Minecraft', inline: true },
          { name: '🎁 **LỆNH CODE QUÀ TẶNG**', value: '────────────' },
          { name: '`code`', value: 'Xem danh sách code quà tặng', inline: true },
          { name: '💍 **LỆNH HÔN NHÂN**', value: '────────────' },
          { name: '`ship @user`', value: 'Để xem độ phụ hợp ghép đôi', inline: true },
          { name: '`kethon @user`', value: 'Để kết hôn với ng mình muốn', inline: true },
          { name: '`lyhon`', value: 'Để ly hôn', inline: true },
          { name: '`capdoi`', value: 'Để xem thông tin đã cưới', inline: true },
          { name: '`topcuoi`', value: 'Để xem thông tin các cặp đôi đã kết hôn', inline: true },
          { name: '📊 **LỆNH THÔNG TIN**', value: '────────────' },
          { name: '`/info` hoặc `info`', value: 'Thông tin về bot', inline: true },
          { name: '`/ping` hoặc `ping`', value: 'Kiểm tra độ trễ của bot', inline: true },
          { name: '`getid [@user]`', value: 'Xem ID của người dùng', inline: true },
          { name: '`owner`', value: 'Xem thông tin chủ bot', inline: true },
          
          { name: '🌐 **LỆNH IP SERVER**', value: '────────────' },
          { name: '`ip`', value: 'Xem thông tin IP server Minecraft', inline: true },
          
          { name: '💰 **THANH TOÁN**', value: '────────────' },
          { name: '`/thanhtoan`', value: 'Thông tin thanh toán + mã QR', inline: true }
        )
        .setFooter({ 
          text: `YumMC Bot - ${hasGuiPerm ? 'Bạn có quyền dùng gui' : 'Không có quyền gui'}`,
          iconURL: client.user.displayAvatarURL() 
        });
      
      // Chỉ thêm phần gui nếu có quyền
      if (hasGuiPerm) {
        const guiDescription = REQUIRE_ADMIN_FOR_GUI 
          ? 'Gửi thông báo quan trọng (Admin only)' 
          : 'Gửi tin nhắn vào kênh (Role restricted),Chỉ Admin mới có quyền dùng lệnh này';
        
        helpEmbed.addFields(
          { name: '💬 **GỬI TIN NHẮN**', value: '────────────' },
          { name: '`/gui` hoặc `gui`', value: guiDescription, inline: true }
        );
      }
      
      return message.channel.send({ embeds: [helpEmbed] });
    }

    /* ===== !ping ===== */
    if (cmd === "ping") {
      const sent = await message.reply('🏓 Pinging...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      
      const pingEmbed = new EmbedBuilder()
        .setColor('#00ff99')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '🤖 Độ trễ bot', value: `${latency}ms`, inline: true },
          { name: '🌐 Độ trễ API', value: `${apiLatency}ms`, inline: true }
        )
        .setTimestamp();
      
      return sent.edit({ content: '', embeds: [pingEmbed] });
    }

    /* ===== !info ===== */
    if (cmd === "info") {
      const infoEmbed = new EmbedBuilder()
        .setColor('#00D4FF')
        .setTitle('🤖 Thông Tin Bot')
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👑 Tên bot', value: client.user.tag, inline: true },
          { name: '🆔 ID', value: client.user.id, inline: true },
          { name: '📅 Ngày tạo', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📊 Số server', value: `${client.guilds.cache.size}`, inline: true },
          { name: '👥 Số user', value: `${client.users.cache.size}`, inline: true },
          { name: '⚡ Phiên bản', value: 'YumMC Bot v2.0', inline: true }
        )
        .setFooter({ text: 'Sử dụng !help để xem lệnh', iconURL: client.user.displayAvatarURL() });
      
      return message.channel.send({ embeds: [infoEmbed] });
    }
    
         /* ===== !ip (Phiên bản nâng cao) ===== */
    if (cmd === "ip") {
      // Tạo button để copy IP
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('copy_java_ip')
            .setLabel('📋 Copy Java IP')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💻'),
          new ButtonBuilder()
            .setCustomId('copy_bedrock_ip')
            .setLabel('📱 Copy Bedrock IP')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📱')
        );
      
      const ipEmbed = new EmbedBuilder()
        .setColor('#00FF99')
        .setTitle('🍀 **EternalSMP Community** 🍀')
        .setDescription('🌐 Thông tin kết nối máy chủ')
        .addFields(
          {
            name: '🎮 **CHẾ ĐỘ MÁY CHỦ**',
            value: '━━━━━━━━━━━━━━━━━━━━',
            inline: false
          },
          {
            name: '🟢 🌴 Thuần Sinh Tồn ',
            value: '```✅ Host lỏ, mở mấy ní chơi tạm```',
            value: '```✅ server k luật, thích làm j làm 🐧```',
            inline: true
          },
          {
            name: '🔴 ⚔️ ʟɪꜰᴇsᴛᴇᴀʟ sᴍᴘ',
            value: '```❎ Sắp mở, nào có tiền thuê host mới thì mở lại```',
            inline: true
          },
          {
            name: '🔴 ⚔️ Box PvP',
            value: '```❎ Chưa mở```',
            inline: true
          },
          {
            name: '🟢 ☁️ SkyBlock',
            value: '```✅ Đã mở! Thử nhiệm!\n🌎ip: sky.yummc.online\n🔌port : 25565```',
            inline: true
          },
          {
            name: '💻 **JAVA EDITION**',
            value: '━━━━━━━━━━━━━━━━━━━━',
            inline: false
          },
          {
            name: '🌎 IP',
            value: '```yummc.online```',
            inline: true
          },
          {
            name: '〽️ Phiên Bản',
            value: '```1.18.x - 1.21.x```',
            inline: true
          },
          {
            name: '📱 **BEDROCK / PE**',
            value: '━━━━━━━━━━━━━━━━━━━━',
            inline: false
          },
          {
            name: '🌎 IP',
            value: '```yummc.online```',
            inline: true
          },
          {
            name: '〽️ Phiên Bản',
            value: '```1.21.111 +```',
            inline: true
          },
          {
            name: '🔌 Port',
            value: '```31213```',
            inline: true
          },
          {
            name: '🧑‍🔧 **TRẠNG THÁI MÁY CHỦ**',
            value: '━━━━━━━━━━━━━━━━━━━━',
            inline: false
          },
          {
            name: '📢 Thông báo',
            value: '```Đang mở```',
            inline: false
          },
          {
            name: '💬 Cập nhật',
            value: '```Mọi thông tin sẽ được cập nhật tại kênh thông báo sau 🥰```',
            inline: false
          },
          {
            name: '❤️ Lời nhắn',
            value: '```Chúc các bạn một ngày tốt lành\n🥰 Luôn luôn ủng hộ sv mình nha 😍```',
            inline: false
          }
        )
        .setImage('https://cdn.discordapp.com/attachments/1453047727117172927/1468059669896626207/87C09904-456F-47EA-A678-2517457545F8.png?ex=6982a49c&is=6981531c&hm=cb81830c1986dc5a6ab186607e3069c37d85db720692d94b110306ad22d8e1e4&') // Thêm banner nếu có
        .setFooter({ 
          text: '🎮 EternalSMP - Kết nối cộng đồng Minecraft Việt Nam',
          iconURL: 'https://cdn.discordapp.com/attachments/1453047727117172927/1468059669896626207/87C09904-456F-47EA-A678-2517457545F8.png?ex=6982a49c&is=6981531c&hm=cb81830c1986dc5a6ab186607e3069c37d85db720692d94b110306ad22d8e1e4&'
        })
        .setTimestamp();
      
      return message.reply({ 
        embeds: [ipEmbed],
        components: [row]
      });
    }
    
        /* ===== !code (Phiên bản nâng cao) ===== */
    if (cmd === "code") {
      // Tạo embed với card design
      const codeEmbed = new EmbedBuilder()
        .setColor('#9B59B6') // Màu tím đẹp mắt
        .setTitle('<a:gift:1107957766495973386> **KHO BÁU CODE - RINH QUÀ MIỄN PHÍ** <a:gift:1107957766495973386>')
        .setDescription('<a:sparkles:1107957800008732723> **Tuyển tập code hot nhất server** <a:sparkles:1107957800008732723>')
        .setThumbnail('https://cdn.discordapp.com/attachments/1107957800008732723/1200000000000000000/gift_box.png')
        .setImage('https://i.imgur.com/rainbow_banner.png')
        .addFields(
          {
            name: '<:diamond:1107957766495973387> ━━━━━━━━━━━━━━━━━━━━ <:diamond:1107957766495973387>',
            value: ' ',
            inline: false
          }
        );
      
      // Tạo các field với card design cho từng code
      const codes = [
        {
          name: 'welcome',
          emoji: '🎊',
          color: '#2ECC71',
          rewards: ['Vào nhập là biết'],
          description: 'Code chào mừng tân thủ, hỗ trợ mn đầu game đỡ khó khăn hơn',
          status: '🟢 ACTIVE'
        },
        {
          name: 'ss3',
          emoji: '⚡', 
          color: '#3498DB',
          rewards: ['Vào nhập là biết ', 'Vào nhập là biết'],
          description: 'Code sự kiện Season 3',
          status: '🟢 ACTIVE'
        },
        {
          name: 'baotri',
          emoji: '🍩',
          color: '#E74C3C',
          rewards: ['Nhập là biết ', 'Nhập là biết'],
          description: 'Chào mừng sự trợ lại của SV',
          status: '🟢 ACTIVE'
        },         
        {
          name: 'LIMIT',
          emoji: '💍',
          color: '#E74C3C',
          rewards: ['400 Shard', '20000 money'],
          description: 'Code Limit hết hàng',
          status: '🔴'
        },
        {
          name: 'DONXUAN',
          emoji: '🌸',
          color: '#9B59B6',
          rewards: ['20000 money'],
          description: 'sắp tết nên ra code',
          status: '🔴'
        }
      ];
      
      // Thêm từng code như một card
      codes.forEach((code, index) => {
        codeEmbed.addFields(
          {
            name: `${code.emoji} **${code.name}** • ${code.status}`,
            value: `\`\`\`ansi\n[2;36m${code.description}[0m\n[2;32m➤ ${code.rewards.join('\n➤ ')}[0m\n\`\`\``,
            inline: false
          }
        );
      });
      
      // Thêm footer và thông tin
      codeEmbed.addFields(
        {
          name: '<:star:1107957766495973388> ━━━━━━━━━━━━━━━━━━━━ <:star:1107957766495973388>',
          value: ' ',
          inline: false
        },
        {
          name: '📊 **THỐNG KÊ**',
          value: '```diff\n+ 4 code đang hoạt động\n- 0 code đã hết hạn\n```',
          inline: true
        },
        {
          name: '⏰ **CẬP NHẬT**',
          value: '```Hôm nay, 13:015```',
          inline: true
        },
        {
          name: '✍🏻 **CÁCH DÙNG**',
          value: '```/code + tên code```',
          inline: true
        },
        {
          name: '🎯 **TỶ LỆ SỬ DỤNG**',
          value: '```53% đã dùng```',
          inline: true
        }
      )
      .setFooter({ 
        text: '💝 Code mới mỗi tuần • Theo dõi #thong-bao-code để không bỏ lỡ!',
        iconURL: 'https://cdn.discordapp.com/emojis/1107957766495973386.webp'
      })
      .setTimestamp();
    return message.reply({ embeds: [codeEmbed] });
    }
      
    /* ===== !gui (Prefix) - KIỂM TRA ROLE ===== */
    if (cmd === "gui") {
      // 🔐 KIỂM TRA QUYỀN THEO ROLE
      if (!hasGuiPermission(message.member)) {
        let errorMessage = "❌ Bạn không có quyền sử dụng lệnh này!";
        
        if (REQUIRE_ADMIN_FOR_GUI) {
          errorMessage = "❌ Bạn cần quyền **Admin** để sử dụng lệnh này!";
        } else if (ALLOWED_ROLE_IDS.length > 0) {
          // Lấy tên các role được phép
          const allowedRoles = ALLOWED_ROLE_IDS
            .map(id => message.guild.roles.cache.get(id)?.name || `Role(${id})`)
            .filter(name => name)
            .join(', ');
          
          errorMessage = `❌ Bạn cần có một trong các role sau: **${allowedRoles}**`;
        }
        
        return message.reply({
          content: errorMessage,
          allowedMentions: { repliedUser: false }
        });
      }
      
      const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const buttonColor = isAdmin ? ButtonStyle.Danger : ButtonStyle.Primary;
      const buttonEmoji = isAdmin ? '📢' : '💬';
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('openSendModal')
            .setLabel(isAdmin ? '📝 Soạn thông báo' : '📝 Soạn tin nhắn')
            .setStyle(buttonColor)
            .setEmoji(buttonEmoji)
        );
      
      const title = isAdmin ? '📢 HỆ THỐNG THÔNG BÁO ADMIN' : '💬 HỆ THỐNG GỬI TIN NHẮN';
      const description = isAdmin 
        ? 'Chỉ **Admin** mới có thể sử dụng tính năng này\nNhấn nút bên dưới để gửi thông báo quan trọng'
        : 'Bạn có quyền gửi tin nhắn vào kênh này\nNhấn nút bên dưới để soạn tin nhắn';
      
      const helpEmbed = new EmbedBuilder()
        .setColor(isAdmin ? '#FF0000' : '#5865F2')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `Yêu cầu bởi ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      
      return message.reply({
        embeds: [helpEmbed],
        components: [row]
      });
    }
  }
});

/* ================= SLASH COMMAND ================= */
client.on("interactionCreate", async interaction => {
  
  /* ====== vote1 ===== */
if (interaction.customId === "vote_create") {

const title = interaction.fields.getTextInputValue("vote_title")
const reward = interaction.fields.getTextInputValue("vote_reward")
const minutes = Number(interaction.fields.getTextInputValue("vote_time"))

if(!minutes || minutes <= 0){
return interaction.reply({
content:"❌ Thời gian không hợp lệ",
ephemeral:true
})
}

let up = 0
let down = 0
const voters = new Set()

const endTime = Date.now() + minutes * 60000

function buildBar(){

const total = up + down
let percent = total === 0 ? 50 : Math.round((up / total) * 100)

let bar = "🟩".repeat(Math.floor(percent/10)) +
"⬜".repeat(10-Math.floor(percent/10))

return {percent,bar}

}

function timeLeft(){
let left = Math.max(0,Math.floor((endTime - Date.now())/1000))
return `${left}s`
}

function buildEmbed(){

const {percent,bar} = buildBar()

return new EmbedBuilder()

.setTitle(`🗳️ ${title}`)

.setDescription(
`🎁 Phần thưởng: ${reward}

👍 Đồng ý : ${up}
👎 Không : ${down}

📊 ${percent}%
${bar}

⏳ Kết thúc sau: ${timeLeft()}`
)

.setColor("Blue")

}

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("vote_yes")
.setLabel("👍 Đồng ý")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("vote_no")
.setLabel("👎 Không")
.setStyle(ButtonStyle.Danger)

)

await interaction.reply({
embeds:[buildEmbed()],
components:[row]
})

const msg = await interaction.fetchReply()

const collector = msg.createMessageComponentCollector({
time: minutes * 60000
})

const countdown = setInterval(()=>{
interaction.editReply({
embeds:[buildEmbed()]
}).catch(()=>{})
},10000)

collector.on("collect", async i=>{

if(voters.has(i.user.id)){
return i.reply({
content:"❌ Bạn đã vote rồi!",
ephemeral:true
})
}

voters.add(i.user.id)

if(i.customId === "vote_yes") up++
if(i.customId === "vote_no") down++

await i.update({
embeds:[buildEmbed()],
components:[row]
})

})

collector.on("end", async()=>{

clearInterval(countdown)

const {percent,bar} = buildBar()

const final = new EmbedBuilder()

.setTitle("🏆 Vote kết thúc")

.setDescription(
`🗳️ ${title}

🎁 Phần thưởng: ${reward}

👍 Đồng ý : ${up}
👎 Không : ${down}

📊 ${percent}%
${bar}`
)

.setColor("Gold")

const disabledRow = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("vote_yes")
.setLabel("👍 Đồng ý")
.setStyle(ButtonStyle.Success)
.setDisabled(true),

new ButtonBuilder()
.setCustomId("vote_no")
.setLabel("👎 Không")
.setStyle(ButtonStyle.Danger)
.setDisabled(true)

)

await interaction.editReply({
embeds:[final],
components:[disabledRow]
})

})

}

  if (interaction.isModalSubmit()) {

  if (interaction.isChatInputCommand()) {
    
    if (interaction.commandName === "online") {
      await interaction.deferReply();

      try {
        const res = await status(
          process.env.MC_IP,
          Number(process.env.MC_PORT)
        );

        const embed = new EmbedBuilder()
          .setColor("#00ff99")
          .setTitle("🟢 TRẠNG THÁI SERVER MINECRAFT")
          .setImage(process.env.SERVER_BANNER)
          .addFields(
            { name: "🌍 Server", value: process.env.MC_IP },
            { name: "🌍 Port", value: process.env.MC_PORT },
            {
              name: "👥 Online",
              value: `${res.players.online}/${res.players.max}`,
              inline: true
            },
            {
              name: "⚙️ Version",
              value: res.version.name,
              inline: true
            }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply("❌ **Server đang OFFLINE!**");
      }
    }

    if (interaction.commandName === "thanhtoan") {
      const embed = new EmbedBuilder()
        .setColor("#00ff99")
        .setTitle("💸 Thông Tin Thanh Toán")
        .setDescription("Vui lòng quét mã QR bên dưới để thanh toán")
        .addFields(
          {
            name: "💰 Số tiền",
            value: `${Number(process.env.PAY_AMOUNT).toLocaleString("vi-VN")} VND`
          },
          {
            name: "🏦 Ngân hàng",
            value: process.env.PAY_BANK,
            inline: true
          },
          {
            name: "🔢 Số tài khoản",
            value: process.env.PAY_ACCOUNT,
            inline: true
          },
          {
            name: "👤 Chủ tài khoản",
            value: process.env.PAY_NAME
          }
        )
        .setImage(process.env.PAY_QR_IMAGE)
        .setFooter({ text: "cre Yummc" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
    
  
 /* ====================== LỆNH /VOTE ====================== */

if (interaction.commandName === "vote") {

if (!interaction.member.roles.cache.has(process.env.ALLOWED_ROLE_ID)) {
return interaction.reply({
content: "❌ Chỉ Admin mới được tạo vote!",
ephemeral: true
})
}

const modal = new ModalBuilder()
.setCustomId("create_vote")
.setTitle("Tạo Vote")

const titleInput = new TextInputBuilder()
.setCustomId("vote_title")
.setLabel("Tên Vote")
.setStyle(TextInputStyle.Short)
.setRequired(true)

const rewardInput = new TextInputBuilder()
.setCustomId("vote_reward")
.setLabel("Phần thưởng")
.setStyle(TextInputStyle.Short)

const timeInput = new TextInputBuilder()
.setCustomId("vote_time")
.setLabel("Thời gian vote (phút)")
.setStyle(TextInputStyle.Short)
.setRequired(true)

const row1 = new ActionRowBuilder().addComponents(titleInput)
const row2 = new ActionRowBuilder().addComponents(rewardInput)
const row3 = new ActionRowBuilder().addComponents(timeInput)

modal.addComponents(row1,row2,row3)

await interaction.showModal(modal)

}
    
    
    /* ===== vote deptrai ====== */
if (interaction.commandName === "votedeptrai") {

const user = interaction.options.getUser("user")

let handsome = 0
let ugly = 0
const voters = new Set()

function buildBar(){

const total = handsome + ugly

let percent = total === 0 ? 50 : Math.round((handsome / total) * 100)

let bar = "🟩".repeat(Math.floor(percent/10)) +
"⬜".repeat(10-Math.floor(percent/10))

return `Độ đẹp trai: ${percent}%\n${bar}`

}

function buildEmbed(){

return new EmbedBuilder()

.setTitle("🗳️ Vote Độ Đẹp Trai")

.setDescription(`Mọi người hãy đánh giá độ đẹp trai của ${user}`)

.addFields(
{name:"👍 Đẹp trai",value:String(handsome),inline:true},
{name:"👎 Xấu trai",value:String(ugly),inline:true},
{name:"📊 Tỉ lệ",value:buildBar()}
)

.setThumbnail(user.displayAvatarURL())

.setColor("Blue")

}

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("vote_handsome")
.setLabel("👍 Đẹp trai")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("vote_ugly")
.setLabel("👎 Xấu trai")
.setStyle(ButtonStyle.Danger)

)

await interaction.reply({
embeds:[buildEmbed()],
components:[row]
})

const msg = await interaction.fetchReply()

const collector = msg.createMessageComponentCollector({
time:600000
})

collector.on("collect", async i=>{

if(voters.has(i.user.id)){

return i.reply({
content:"❌ Bạn đã vote rồi!",
ephemeral:true
})

}

voters.add(i.user.id)

await i.update({
embeds:[
new EmbedBuilder()
.setTitle("📊 Đang cập nhật vote...")
.setDescription("⏳ Đợi chút...")
.setColor("Yellow")
],
components:[]
})

setTimeout(async()=>{

if(i.customId === "vote_handsome") handsome++
if(i.customId === "vote_ugly") ugly++

await interaction.editReply({
embeds:[buildEmbed()],
components:[row]
})

},1500)

})

collector.on("end", async()=>{

const final = new EmbedBuilder()

.setTitle("🏆 Kết quả vote")

.setDescription(`${user} đã được server đánh giá`)

.addFields(
{name:"👍 Đẹp trai",value:String(handsome),inline:true},
{name:"👎 Xấu trai",value:String(ugly),inline:true},
{name:"📊 Kết quả",value:buildBar()}
)

.setColor("Gold")

await interaction.followUp({
embeds:[final]
})

})

}
  
    
  /* ====== tatrot ===== */
if (interaction.commandName === "tarot") {

const wish = interaction.options.getString("mongmuon")

const shuffled = [...tarotDeck].sort(()=>0.5-Math.random())
const cards = shuffled.slice(0,3)

let chosenIndex = []
let revealed = []

// khóa khi đang lật bài
let choosing = false

function buildButtons(){

const row = new ActionRowBuilder()

for(let i=0;i<5;i++){

let label = "🂠"
let style = ButtonStyle.Secondary
let disabled = false

if(revealed.includes(i)){
label = "✨"
style = ButtonStyle.Success
disabled = true
}

row.addComponents(
new ButtonBuilder()
.setCustomId("card_"+i)
.setLabel(label)
.setStyle(style)
.setDisabled(disabled)
)

}

return row

}

await interaction.reply({
embeds:[
new EmbedBuilder()
.setTitle("🔮 Tarot Reading")
.setDescription(
`✨ Mong muốn: *${wish}*

🃏 Hãy chọn **3 lá bài** để xem vận mệnh`
)
.setColor("Purple")
],
components:[buildButtons()]
})

const msg = await interaction.fetchReply()

const collector = msg.createMessageComponentCollector({
time:60000
})

collector.on("collect", async i=>{

if(i.user.id !== interaction.user.id){
return i.reply({
content:"❌ Đây không phải lượt của bạn",
ephemeral:true
})
}

if(choosing) return

const index = Number(i.customId.split("_")[1])

if(chosenIndex.includes(index)){
return i.reply({
content:"⚠️ Bạn đã chọn lá này rồi",
ephemeral:true
})
}

choosing = true

chosenIndex.push(index)
revealed.push(index)

await i.update({
embeds:[
new EmbedBuilder()
.setTitle("🔮 Tarot Reading")
.setDescription(
`✨ Mong muốn: *${wish}*

🃏 Đang lật bài...`
)
.setColor("Purple")
],
components:[]
})

setTimeout(async()=>{

const card = cards[chosenIndex.length-1]

const embed = new EmbedBuilder()

.setTitle(`🔮 Lá bài ${chosenIndex.length}`)

.setDescription(`**${card.name}**`)

.addFields(
{
name:"📜 Ý nghĩa",
value:card.meaning
},
{
name:"🔗 Liên quan đến mong muốn",
value:`"${wish}" chịu ảnh hưởng bởi: ${card.meaning}`
}
)

.setColor("Purple")

await interaction.followUp({embeds:[embed]})

choosing = false

await interaction.editReply({
components:[buildButtons()]
})

if(chosenIndex.length === 3){

const final = new EmbedBuilder()

.setTitle("🌌 Tổng Kết Tarot")

.setDescription(
`✨ Mong muốn: *${wish}*

Ba lá bài đã chỉ ra rằng vận mệnh của bạn đang chịu ảnh hưởng từ nhiều yếu tố khác nhau. Hãy suy nghĩ kỹ về những thông điệp mà các lá bài mang lại.`
)

.setColor("Gold")

await interaction.followUp({embeds:[final]})

collector.stop()

}

},2000)

})

}
    

    /* ===== /gui - KIỂM TRA ROLE ===== */
    if (interaction.commandName === "gui") {
      // 🔐 KIỂM TRA QUYỀN THEO ROLE
      if (!hasGuiPermission(interaction.member)) {
        let errorMessage = "❌ Bạn không có quyền sử dụng lệnh này!";
        
        if (REQUIRE_ADMIN_FOR_GUI) {
          errorMessage = "❌ Bạn cần quyền **Admin** để sử dụng lệnh này!";
        } else if (ALLOWED_ROLE_IDS.length > 0) {
          // Lấy tên các role được phép
          const allowedRoles = ALLOWED_ROLE_IDS
            .map(id => interaction.guild.roles.cache.get(id)?.name || `Role(${id})`)
            .filter(name => name)
            .join(', ');
          
          errorMessage = `❌ Bạn cần có một trong các role sau: **${allowedRoles}**`;
        }
        
        return interaction.reply({
          content: errorMessage,
          ephemeral: true
        });
      }
      
      const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const buttonColor = isAdmin ? ButtonStyle.Danger : ButtonStyle.Primary;
      const buttonEmoji = isAdmin ? '📢' : '💬';
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('openSendModal')
            .setLabel(isAdmin ? '📝 Soạn thông báo' : '📝 Soạn tin nhắn')
            .setStyle(buttonColor)
            .setEmoji(buttonEmoji)
        );
      
      const title = isAdmin ? '📢 HỆ THỐNG THÔNG BÁO ADMIN' : '💬 HỆ THỐNG GỬI TIN NHẮN';
      const description = isAdmin 
        ? 'Chỉ **Admin** mới có thể sử dụng tính năng này\nNhấn nút bên dưới để gửi thông báo quan trọng'
        : 'Bạn có quyền gửi tin nhắn vào kênh này\nNhấn nút bên dưới để soạn tin nhắn';
      
      const helpEmbed = new EmbedBuilder()
        .setColor(isAdmin ? '#FF0000' : '#5865F2')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
      
      await interaction.reply({
        embeds: [helpEmbed],
        components: [row],
        ephemeral: true
      });
    }

    if (interaction.commandName === "help") {
      const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const hasGuiPerm = hasGuiPermission(interaction.member);
      
      const helpEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📖 Hướng Dẫn Sử Dụng Bot')
        .setDescription('Danh sách các lệnh Slash Commands:')
        .addFields(
          { name: '🎮 **MINECRAFT (Public)**', value: '────────────' },
          { name: '`/online`', value: 'Xem trạng thái server Minecraft' },
          
          { name: '📊 **THÔNG TIN (Public)**', value: '────────────' },
          { name: '`/info`', value: 'Thông tin về bot' },
          { name: '`/ping`', value: 'Kiểm tra độ trễ của bot' },
          
          { name: '💰 **THANH TOÁN (Public)**', value: '────────────' },
          { name: '`/thanhtoan`', value: 'Thông tin thanh toán + mã QR' }
        )
        .setFooter({ 
          text: `YumMC Bot - ${hasGuiPerm ? 'Bạn có quyền dùng /gui' : 'Không có quyền /gui'}`,
          iconURL: client.user.displayAvatarURL() 
        });
      
      if (hasGuiPerm) {
        const guiDescription = REQUIRE_ADMIN_FOR_GUI 
          ? 'Gửi thông báo quan trọng (Admin only)' 
          : 'Gửi tin nhắn vào kênh (Role restricted)';
        
        helpEmbed.addFields(
          { name: '💬 **GỬI TIN NHẮN**', value: '────────────' },
          { name: '`/gui`', value: guiDescription }
        );
      }
      
      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    if (interaction.commandName === "ping") {
      const pingEmbed = new EmbedBuilder()
        .setColor('#00ff99')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '🤖 Độ trễ bot', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
          { name: '🌐 Độ trễ API', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [pingEmbed] });
    }

    if (interaction.commandName === "info") {
      const infoEmbed = new EmbedBuilder()
        .setColor('#00D4FF')
        .setTitle('🤖 Thông Tin Bot')
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👑 Tên bot', value: client.user.tag, inline: true },
          { name: '🆔 ID', value: client.user.id, inline: true },
          { name: '📅 Ngày tạo', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📊 Số server', value: `${client.guilds.cache.size}`, inline: true },
          { name: '👥 Số user', value: `${client.users.cache.size}`, inline: true },
          { name: '⚡ Phiên bản', value: 'YumMC Bot v2.0', inline: true }
        )
        .setFooter({ text: 'Sử dụng /help để xem lệnh', iconURL: client.user.displayAvatarURL() });
      
      await interaction.reply({ embeds: [infoEmbed] });
    }
  }
  
  if (interaction.isButton() && interaction.customId === 'openSendModal') {
    await handleOpenModal(interaction);
  }
  
    // Xử lý button copy IP
  if (interaction.isButton()) {
    if (interaction.customId === 'copy_java_ip') {
      await interaction.reply({
        content: '📋 **Bấm giữ vào ip mà coppy đê:**\n```yummc.online```\nPhiên bản: 1.18.x - 1.21.x',
        ephemeral: true
      });
    }
    
    //phần khác
    if (interaction.customId === 'copy_bedrock_ip') {
      await interaction.reply({
        content: '📱 **Bấm giữ vào ip mà coppy đê:**\n```yummc.online```\nPort: `25570`\nPhiên bản: 1.21.111+',
        ephemeral: true
      });
    }
  }
  
  if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
  }
});

/* ================= LỖI ================= */
client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

/* ===== kết hôn =====*/


/* ================= LOGIN ================= */
client.login(process.env.TOKEN).catch(error => {
  console.error('❌ Không thể đăng nhập bot:', error);
  process.exit(1);

});




