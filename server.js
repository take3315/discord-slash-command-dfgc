const http = require("http");
const {
  Client,
  GatewayIntentBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const gasApiReport = process.env.GAS_API_REPORT;
const gasApiTokenChange = process.env.GAS_API_TOKENCHANGE;
const gasURL = process.env.GAS_URL;
const axios = require("axios");

// Create a Discord client with the specified intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready");
});

// Step 1: Select the month
async function selectMonth(interaction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId("monthselect")
    .setPlaceholder("Select a month...")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("1月").setValue("1"),
      new StringSelectMenuOptionBuilder().setLabel("2月").setValue("2"),
      new StringSelectMenuOptionBuilder().setLabel("3月").setValue("3"),
      new StringSelectMenuOptionBuilder().setLabel("4月").setValue("4"),
      new StringSelectMenuOptionBuilder().setLabel("5月").setValue("5"),
      new StringSelectMenuOptionBuilder().setLabel("6月").setValue("6"),
      new StringSelectMenuOptionBuilder().setLabel("7月").setValue("7"),
      new StringSelectMenuOptionBuilder().setLabel("8月").setValue("8"),
      new StringSelectMenuOptionBuilder().setLabel("9月").setValue("9"),
      new StringSelectMenuOptionBuilder().setLabel("10月").setValue("10"),
      new StringSelectMenuOptionBuilder().setLabel("11月").setValue("11"),
      new StringSelectMenuOptionBuilder().setLabel("12月").setValue("12"),
    );

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({
    content: "報告月を選択して下さい",
    components: [row],
    ephemeral: true,
  });

  // Wait for the user to select a month from the menu
  const filter = (i) =>
    i.customId === "monthselect" && i.user.id === interaction.user.id;
  const monthCollector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  return new Promise((resolve, reject) => {
    monthCollector.on("collect", (i) => {
      i.deferUpdate();
      resolve(i.values[0]);
    });

    monthCollector.on("end", () => {
      reject(new Error("No month selected in time."));
    });
  });
}

// Step 2: Select the activity level
async function selectActivityLevel(interaction, selectedMonth) {
  const select2 = new StringSelectMenuBuilder()
    .setCustomId("activityselect")
    .setPlaceholder("Select activity level...")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("1.フルタイム＋フルコミット")
        .setValue(":one:"),
      new StringSelectMenuOptionBuilder()
        .setLabel("2.フルタイム")
        .setValue(":two:"),
      new StringSelectMenuOptionBuilder()
        .setLabel("3.レギュラー")
        .setValue(":three:"),
      new StringSelectMenuOptionBuilder()
        .setLabel("4.スポット")
        .setValue(":four:"),
      new StringSelectMenuOptionBuilder().setLabel("5.休暇").setValue(":five:"),
      new StringSelectMenuOptionBuilder().setLabel("6.休止").setValue(":six:"),
    );

  const row2 = new ActionRowBuilder().addComponents(select2);

  // Send the second interaction to the user with the activityselect menu
  await interaction.followUp({
    content: `${selectedMonth}月の活動係数を選択して下さい`,
    components: [row2],
    ephemeral: true,
  });

  // Wait for the user to select an activity level
  const filter = (i) =>
    i.customId === "activityselect" && i.user.id === interaction.user.id;
  const activityCollector = interaction.channel.createMessageComponentCollector(
    { filter, time: 15000 },
  );

  return new Promise((resolve, reject) => {
    activityCollector.on("collect", (i) => {
      i.deferUpdate();
      resolve(i.values[0]);
    });

    activityCollector.on("end", () => {
      reject(new Error("No activity level selected in time."));
    });
  });
}

//Token Change request
async function selectToken(interaction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId("tokenselect")
    .setPlaceholder("Select a token...")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("TXJP").setValue("TXJP"),
      new StringSelectMenuOptionBuilder().setLabel("ETH").setValue("ETH"),
      new StringSelectMenuOptionBuilder().setLabel("crvUSD").setValue("crvUSD"),
      new StringSelectMenuOptionBuilder().setLabel("CJPY").setValue("CJPY"),
    );
  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({
    content: "報酬トークンを選択して下さい",
    components: [row],
    ephemeral: true,
  });
  // Wait for the user to select a month from the menu
  const filter = (i) =>
    i.customId === "tokenselect" && i.user.id === interaction.user.id;
  const tokenCollector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  return new Promise((resolve, reject) => {
    tokenCollector.on("collect", (i) => {
      i.deferUpdate();
      resolve(i.values[0]);
    });

    tokenCollector.on("end", () => {
      reject(new Error("No month selected in time."));
    });
  });
}

// Handle the 'report' command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "report") {
    const selectedMonth = await selectMonth(interaction);
    const selectedActivityLevel = await selectActivityLevel(
      interaction,
      selectedMonth,
    );

    // Get the username of the user who triggered the interaction
    const username = interaction.user.username;
    const userId = interaction.user.id;

    // Get the member object to access the roles
    const member = interaction.member;

    // Get an array of role IDs the user has
    const roleIds = [];
    member.roles.cache.forEach((role) => {
      roleIds.push(role.id);
    });

    try {
      // Send the final response containing the selected month, activity level, username, user ID, and role IDs
      await interaction.followUp({
        content: `<@${userId}>から${selectedMonth}月の活動係数${selectedActivityLevel}の報告がありました`,
      });

      // Prepare the data object for the Google Apps Script web app
      const dataObj = {
        username: username,
        reportMonth: selectedMonth,
        userId: userId,
        activity: selectedActivityLevel,
      };

      // Add role IDs dynamically to the data object using a loop
      roleIds.forEach((roleId, index) => {
        dataObj[`roleId${index + 1}`] = roleId;
      });

      const api = gasApiReport;

      // Call the function to write the data to the Google Sheets
      await writeToGAS(dataObj, api);
    } catch (error) {
      console.error("Error sending messages:", error);
    }
  }

  if (commandName === "tokenchange") {
    const selectedToken = await selectToken(interaction);

    // Get the username of the user who triggered the interaction
    const userId = interaction.user.id;
    try {
      await interaction.followUp({
        content: `<@${userId}>が受取トークンを${selectedToken}に変更しました`,
      });

      // Prepare the data object for the Google Apps Script web app
      const dataObj = {
        userId: userId,
        reportToken: selectedToken,
      };

      const api = gasApiTokenChange;

      // Call the function to write the data to the Google Sheets
      await writeToGAS(dataObj, api);
    } catch (error) {
      console.error("Error sending messages:", error);
    }
  }
});

// Function to write data to the GAS
async function writeToGAS(dataObj, api) {
  try {
    // Append the API key as a URL parameter
    const queryParams = new URLSearchParams({ api_key: api }).toString();
    const gas = `${gasURL}?${queryParams}`;

    // Send the append request to the Google Apps Script web app
    const response = await axios.post(gas, dataObj);

    console.log("Data written to the Google Sheets successfully:", response);
  } catch (error) {
    console.error("Error writing data:", error.message);
  }
}

// Log in to Discord using the bot token
client.login(DISCORD_TOKEN);

const server = http.createServer((req, res) => {
  // Send a basic response for any request to the server
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Server is running.");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
