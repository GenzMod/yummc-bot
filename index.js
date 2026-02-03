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
const { status } = require("minecraft-server-util");

/* ================= CLIENT ================= */
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
    console.log(`🔐 Cấu hình quyền !gui: ${REQUIRE_ADMIN_FOR_GUI ? 'Chỉ Admin' : 'Theo Role'}`);
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

      channel.send({
        content: `<@&${process.env.ADMIN_ROLE_ID}>`,
        embeds: [embed],
        allowedMentions: { roles: [process.env.ADMIN_ROLE_ID] }
      });
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

      channel.send({
        content: `<@&${process.env.ADMIN_ROLE_ID}>`,
        embeds: [embed],
        allowedMentions: { roles: [process.env.ADMIN_ROLE_ID] }
      });
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
      content: '❌ Không thể mở form nhập liệu!',
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
  
  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    /* ===== !getid ===== */
    if (cmd === "getid") {
      const user = message.mentions.users.first() || message.author;

      const embed = new EmbedBuilder()
        .setColor("#ff5fa2")
        .setTitle("🆔 THÔNG TIN ID")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤 User", value: `<@${user.id}>`, inline: true },
          { name: "🏷️ Tag", value: user.username, inline: true },
          { name: "🆔 ID", value: user.id },
          { name: "🤖 Bot", value: user.bot ? "Có" : "Không" },
          {
            name: "📆 Tạo",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`
          }
        )
        .setFooter({ text: "YumMC Bot" });

      return message.channel.send({ embeds: [embed] });
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
        return message.channel.send("❌ Server đang OFFLINE!");
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
            name: '🟢 ⚔️ Eco Sword',
            value: '```✅ Tạm đóng```',
            inline: true
          },
          {
            name: '🔴 ⚔️ Box PvP',
            value: '```❎ Chưa mở```',
            inline: true
          },
          {
            name: '🔴 ☁️ SkyBlock',
            value: '```❎ Chưa mở```',
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
            value: '```25570```',
            inline: true
          },
          {
            name: '🧑‍🔧 **TRẠNG THÁI MÁY CHỦ**',
            value: '━━━━━━━━━━━━━━━━━━━━',
            inline: false
          },
          {
            name: '📢 Thông báo',
            value: '```Đang bảo trì, Sẽ mở lại sv vào tối nay```',
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
          name: 'WELCOME',
          emoji: '🎊',
          color: '#2ECC71',
          rewards: ['5,000 Coins', 'Rương Vật Phẩm', 'VIP 3 ngày', 'Pet Mèo Dễ Thương'],
          description: 'Code chào mừng tân thủ',
          status: '🟢 ACTIVE'
        },
        {
          name: 'SS2',
          emoji: '⚡', 
          color: '#3498DB',
          rewards: ['10,000 Coins', 'Skin Độc Quyền', 'Pet SS2 Limited', 'Wings Bay'],
          description: 'Code sự kiện Season 2',
          status: '🟡 LIMITED'
        },
        {
          name: 'DENBUN',
          emoji: '🍩',
          color: '#E74C3C',
          rewards: ['7,500 Coins', 'Donut Buff', 'Voucher 20%', 'Food Bundle'],
          description: 'Code hợp tác DenBun',
          status: '🟢 ACTIVE'
        },
        {
          name: 'TANXUAN9K',
          emoji: '🌸',
          color: '#9B59B6',
          rewards: ['9,000 Coins', 'Áo Dài Tết', 'Pháo Hoa', 'Lì Xì May Mắn'],
          description: 'Code mừng xuân 9K',
          status: '🔴 EXPIRED SOON'
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
          value: '```diff\n+ 4 code đang hoạt động\n! 1 code sắp hết hạn\n- 0 code đã hết hạn\n```',
          inline: true
        },
        {
          name: '⏰ **CẬP NHẬT**',
          value: '```Hôm nay, 15:30```',
          inline: true
        },
        {
          name: '🎯 **TỶ LỆ SỬ DỤNG**',
          value: '```92% đã dùng```',
          inline: true
        }
      )
      .setFooter({ 
        text: '💝 Code mới mỗi tuần • Theo dõi #thong-bao-code để không bỏ lỡ!',
        iconURL: 'https://cdn.discordapp.com/emojis/1107957766495973386.webp'
      })
      .setTimestamp();
      
      // Tạo các nút bấm với màu sắc riêng
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('view_welcome')
            .setLabel('Xem WELCOME')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎊'),
          new ButtonBuilder()
            .setCustomId('view_ss2')
            .setLabel('Xem SS2')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚡'),
          new ButtonBuilder()
            .setCustomId('view_denbun')
            .setLabel('Xem DENBUN')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🍩'),
          new ButtonBuilder()
            .setCustomId('view_tanxuan9k')
            .setLabel('Xem TANXUAN9K')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌸'),
          new ButtonBuilder()
            .setCustomId('view_all_codes')
            .setLabel('Xem tất cả')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋')
        );
      
      return message.reply({ 
        embeds: [codeEmbed],
        components: [row]
      });
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
    
      // Xử lý button cho lệnh !code
  if (interaction.isButton()) {
    
    // Xử lý copy code
    if (interaction.customId === 'copy_welcome') {
      await interaction.reply({
        content: '🎊 **Code WELCOME đã được copy!**\n```WELCOME```\n*Nhập trong game bằng lệnh:* `/redeem WELCOME`',
        ephemeral: true
      });
    }
    
    if (interaction.customId === 'copy_ss2') {
      await interaction.reply({
        content: '⚡ **Code SS2 đã được copy!**\n```SS2```\n*Nhập trong game bằng lệnh:* `/redeem SS2`',
        ephemeral: true
      });
    }
    
    if (interaction.customId === 'copy_denbun') {
      await interaction.reply({
        content: '🍩 **Code DENBUN đã được copy!**\n```DENBUN```\n*Nhập trong game bằng lệnh:* `/redeem DENBUN`',
        ephemeral: true
      });
    }
    
    if (interaction.customId === 'copy_tanxuan9k') {
      await interaction.reply({
        content: '🌸 **Code TANXUAN9K đã được copy!**\n```TANXUAN9K```\n*Nhập trong game bằng lệnh:* `/redeem TANXUAN9K`',
        ephemeral: true
      });
    }
    
    // Xử lý refresh
    if (interaction.customId === 'refresh_codes') {
      await interaction.deferUpdate();
      // Có thể thêm logic refresh code ở đây
      await interaction.followUp({
        content: '🔄 Đã làm mới danh sách code!',
        ephemeral: true
      });
    }
    
    // Xử lý xem chi tiết code (cho phiên bản nâng cao)
    if (interaction.customId.startsWith('view_')) {
      const codeName = interaction.customId.replace('view_', '').toUpperCase();
      
      if (codeName === 'ALL_CODES') {
        // Hiển thị modal với tất cả code
        const modal = new ModalBuilder()
          .setCustomId('all_codes_modal')
          .setTitle('📋 Tất Cả Code Hiện Có');
        
        const codeList = new TextInputBuilder()
          .setCustomId('code_list')
          .setLabel('Danh sách code (copy để sử dụng)')
          .setStyle(TextInputStyle.Paragraph)
          .setValue('WELCOME\nSS2\nDENBUN\nTANXUAN9K\n\nSử dụng: /redeem <code>')
          .setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(codeList));
        await interaction.showModal(modal);
      } else {
        // Hiển thị chi tiết từng code
        const codeDetails = {
          'WELCOME': {
            color: '#2ECC71',
            rewards: '• 5,000 Coins\n• Rương Vật Phẩm\n• VIP 3 ngày\n• Pet Mèo',
            expires: 'Không giới hạn',
            usage: '1 lần/người'
          },
          'SS2': {
            color: '#3498DB',
            rewards: '• 10,000 Coins\n• Skin Độc Quyền\n• Pet SS2 Limited\n• Wings Bay',
            expires: '31/12/2024',
            usage: '1 lần/người'
          },
          'DENBUN': {
            color: '#E74C3C',
            rewards: '• 7,500 Coins\n• Donut Buff\n• Voucher 20%\n• Food Bundle',
            expires: 'Không giới hạn',
            usage: '1 lần/người'
          },
          'TANXUAN9K': {
            color: '#9B59B6',
            rewards: '• 9,000 Coins\n• Áo Dài Tết\n• Pháo Hoa\n• Lì Xì May Mắn',
            expires: '15/02/2024',
            usage: '1 lần/người'
          }
        };
        
        const detail = codeDetails[codeName];
        if (detail) {
          const detailEmbed = new EmbedBuilder()
            .setColor(detail.color)
            .setTitle(`🎁 **CODE ${codeName}**`)
            .setDescription(`\`\`\`${codeName}\`\`\``)
            .addFields(
              { name: '🎯 **PHẦN THƯỞNG**', value: detail.rewards, inline: false },
              { name: '⏰ **HẠN SỬ DỤNG**', value: detail.expires, inline: true },
              { name: '🔢 **SỐ LẦN DÙNG**', value: detail.usage, inline: true },
              { name: '🎮 **CÁCH DÙNG**', value: '```/redeem ' + codeName + '```', inline: false }
            )
            .setFooter({ text: 'Nhấn Copy để sao chép code' })
            .setTimestamp();
          
          await interaction.reply({
            embeds: [detailEmbed],
            ephemeral: true,
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`copy_${codeName.toLowerCase()}`)
                  .setLabel(`Copy ${codeName}`)
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('📋')
              )
            ]
          });
        }
      }
    }
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

/* ================= LOGIN ================= */
client.login(process.env.TOKEN).catch(error => {
  console.error('❌ Không thể đăng nhập bot:', error);
  process.exit(1);

});


