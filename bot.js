require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`Web server is running on port ${port}`);
});

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Events,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const SETUP_CHANNEL_ID = process.env.SETUP_CHANNEL_ID;
const BANNER_URL = process.env.BANNER_URL;

const gameData = {
    'valorant': {
        label: 'Valorant',
        description: '',
        emoji: '1509921504152916068',
        roleId: '1510011363362214098',
        ranks: [
            { label: 'Platinum', value: 'rank_val_plat', roleId: '1509960992094949396', emoji: '💠' },
            { label: 'Diamond', value: 'rank_val_dia', roleId: '1509963430801703043', emoji: '💎' },
            { label: 'Ascendant', value: 'rank_val_asc', roleId: '1509963598162825526', emoji: '🟢' },
            { label: 'Immortal', value: 'rank_val_imm', roleId: '1509963715837956197', emoji: '🔴' },
            { label: 'Radiant', value: 'rank_val_rad', roleId: '1509963820657938614', emoji: '✨' }
        ]
    },
    'rov': {
        label: 'RoV',
        description: '',
        emoji: '1509921978600132638',
        roleId: '1510011420484440276',
        ranks: [
            { label: 'Diamond', value: 'rank_rov_dia', roleId: '1509965084284162139', emoji: '💎' },
            { label: 'Commander', value: 'rank_rov_commander', roleId: '1509965167172128971', emoji: '👑' },
            { label: 'Conqueror', value: 'rank_rov_conqueror', roleId: '1509965355060170782', emoji: '🔴' },
            { label: 'Supreme Conqueror', value: 'rank_rov_supreme', roleId: '1509965421636485201', emoji: '🔴' },
            { label: 'Glorious Ruler', value: 'rank_rov_glorious', roleId: '1509965599374311655', emoji: '✨' }
        ]
    },
    'mlbb': {
        label: 'Mobile Legends (MLBB)',
        description: '',
        emoji: '1509921694993612902',
        roleId: '1510011480488149032',
        ranks: [
            { label: 'Epic', value: 'rank_ml_epic', roleId: '1509966317904466023', emoji: '🟢' },
            { label: 'Legend', value: 'rank_ml_legend', roleId: '1509966388683477202', emoji: '🔮' },
            { label: 'Mythic', value: 'rank_ml_mythic', roleId: '1509966490370179325', emoji: '🌟' }
        ]
    },
    'pubg': {
        label: 'PUBG',
        description: '',
        emoji: '1509924287291850793',
        roleId: '1510011730078597322',
        ranks: [
            { label: 'Diamond', value: 'rank_pubg_dia', roleId: '1509967203808837875', emoji: '💎' },
            { label: 'Crown', value: 'rank_pubg_crown', roleId: '1509967242505490432', emoji: '👑' },
            { label: 'Ace', value: 'rank_pubg_ace', roleId: '1509967438996049932', emoji: '🔥' },
            { label: 'Conqueror', value: 'rank_pubg_conq', roleId: '1509967497028173904', emoji: '🌟' }
        ]
    },
    'freefire': {
        label: 'FF',
        description: '',
        emoji: '1509924266886430872',
        roleId: 'ROLE_ID_FREEFIRE',
        ranks: [
            { label: 'Heroic', value: 'rank_ff_heroic', roleId: '1509970712167710942', emoji: '🦅' },
            { label: 'Grandmaster', value: 'rank_ff_grandmaster', roleId: '1509970797102366933', emoji: '🌟' }
        ]
    },
    'roblox': {
        label: 'Roblox',
        description: '',
        emoji: '1509921844235468930',
        roleId: '1509971476898386001'
    },
    'genshin': {
        label: 'Genshin Impact',
        description: '',
        emoji: '1509921757933342923',
        roleId: '1509971614589259837'
    },
    'gtav': {
        label: 'FiveM',
        description: '',
        emoji: '1509920973984366783',
        roleId: '1509971554497466540'
    },
    'minecraft': {
        label: 'Minecraft',
        description: '',
        emoji: '1509922045469655122',
        roleId: '1509971701683851345'
    }
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
});

// === 🚀 ลงทะเบียน Slash Commands 🚀 ===
const commands = [
    new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('สร้างข้อความรับยศอัตโนมัติ')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ บอทพร้อมทำงานแล้วในชื่อ ${c.user.tag}`);
    
    try {
        console.log('⏳ กำลังลงทะเบียน Slash Commands...');
        await rest.put(
            Routes.applicationCommands(c.user.id),
            { body: commands },
        );
        console.log('✅ ลงทะเบียน Slash Commands สำเร็จ!');
    } catch (error) {
        console.error('❌ ไม่สามารถลงทะเบียน Slash Commands ได้:', error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    // จัดการ Slash Commands
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup-roles') {
            const channel = client.channels.cache.get(SETUP_CHANNEL_ID);
            if (!channel) return interaction.reply({ content: 'ไม่พบห้องที่ตั้งค่าไว้ กรุณาตรวจสอบ SETUP_CHANNEL_ID ในไฟล์ .env', ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setImage(BANNER_URL);

            const gameSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_game') 
                .setPlaceholder('เลือกยศ/เกมที่ต้องการ (เลือกได้หลายอัน)') 
                .setMinValues(1)
                .setMaxValues(Object.keys(gameData).length);

            for (const [key, data] of Object.entries(gameData)) {
                gameSelectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(data.label)
                        .setDescription(data.description || ' ')
                        .setValue(key) 
                        .setEmoji(data.emoji)
                );
            }

            const row = new ActionRowBuilder().addComponents(gameSelectMenu);

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ สร้างข้อความรับยศเรียบร้อยแล้วที่ห้อง <#${SETUP_CHANNEL_ID}>`, ephemeral: true });
        }
        return;
    }

    // จัดการ Select Menu
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'select_game') {
        const selectedGames = interaction.values;
        const member = interaction.member;

        let responseMessage = '⚙️ **ระบบจัดการยศอัตโนมัติ:**\n';
        const rankSelectionComponents = [];

        for (const gameKey of selectedGames) {
            const gameInfo = gameData[gameKey];
            if (gameInfo) {
                const role = interaction.guild.roles.cache.get(gameInfo.roleId);
                if (role) {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        responseMessage += `➖ ถอดยศเกม **${gameInfo.label}** ออกแล้ว\n`;
                    } else {
                        await member.roles.add(role);
                        responseMessage += `➕ มอบยศเกม **${gameInfo.label}** เรียบร้อยแล้ว\n`;

                        if (gameInfo.ranks && gameInfo.ranks.length > 0) {
                            const rankMenu = new StringSelectMenuBuilder()
                                .setCustomId(`select_rank_${gameKey}`) 
                                .setPlaceholder(`เลือกระดับแรงค์ใน ${gameInfo.label}`)
                                .setMinValues(1)
                                .setMaxValues(1);

                            gameInfo.ranks.forEach(rank => {
                                rankMenu.addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(rank.label)
                                        .setValue(rank.value)
                                        .setEmoji(rank.emoji)
                                );
                            });

                            rankSelectionComponents.push(new ActionRowBuilder().addComponents(rankMenu));
                        }
                    }
                } else {
                    console.error(`ไม่พบ Role ID: ${gameInfo.roleId} สำหรับเกม ${gameInfo.label}`);
                }
            }
        }

        if (rankSelectionComponents.length > 5) {
            rankSelectionComponents.splice(5);
            responseMessage += `⚠️ *ระบบแสดงกล่องเลือกแรงค์ได้สูงสุดเพียง 5 เกมแรกเท่านั้น*`;
        }

        await interaction.reply({ 
            content: responseMessage, 
            components: rankSelectionComponents,
            ephemeral: true 
        });
    }

    else if (interaction.customId.startsWith('select_rank_')) {
        const gameKey = interaction.customId.replace('select_rank_', ''); 
        const selectedRankValue = interaction.values[0]; 
        const member = interaction.member;
        const gameInfo = gameData[gameKey];

        if (!gameInfo) return interaction.reply({ content: '❌ ไม่พบข้อมูลเกมนี้', ephemeral: true });

        const rankInfo = gameInfo.ranks.find(r => r.value === selectedRankValue);
        if (!rankInfo) return interaction.reply({ content: '❌ ไม่พบข้อมูลแรงค์นี้', ephemeral: true });

        const newRankRole = interaction.guild.roles.cache.get(rankInfo.roleId);
        if (!newRankRole) return interaction.reply({ content: '❌ ไม่พบ Role ของแรงค์นี้ในดิสคอร์ด', ephemeral: true });

        const rankRolesToRemove = gameInfo.ranks.map(r => r.roleId);
        for (const rId of rankRolesToRemove) {
             if (member.roles.cache.has(rId) && rId !== newRankRole.id) {
                 const oldRole = interaction.guild.roles.cache.get(rId);
                 if (oldRole) await member.roles.remove(oldRole);
             }
        }

        await member.roles.add(newRankRole);

        await interaction.update({ 
            content: `✅ อัปเดตข้อมูลเสร็จสิ้น!\nคุณได้รับยศแรงค์ **${rankInfo.emoji} ${rankInfo.label}** สำหรับเกม **${gameInfo.label}** เรียบร้อยแล้ว`, 
            components: [] 
        });
    }
});

client.login(TOKEN);
