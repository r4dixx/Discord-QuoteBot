/*jshint esversion: 6 */

require('./discordHelper.js')();
require('./dbQueries.js')();

login();

dbCreateTableIfNecessary();

getClient().on('message', (message) => {

  const CONFIG = require('./config.json');
  const PREFIX = CONFIG.prefix;

  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const MESSAGE = message.content;

  const CONFIG_COMMAND = CONFIG.command;
  const CONFIG_FEEDBACK = CONFIG.feedback;
  const CONFIG_FEEDBACK_SUCCESS = CONFIG_FEEDBACK.success;
  const CONFIG_FEEDBACK_ERROR = CONFIG_FEEDBACK.error;

  const COMMAND_GET = PREFIX + CONFIG_COMMAND.get;
  const COMMAND_ADD = PREFIX + CONFIG_COMMAND.add;
  const COMMAND_DELETE = PREFIX + CONFIG_COMMAND.delete;
  const COMMAND_HELP = PREFIX + CONFIG_COMMAND.help;

  if (MESSAGE === COMMAND_GET) sendQuoteRandom();
  else if (MESSAGE.startsWith(`${COMMAND_ADD} `)) addQuote();
  else if (MESSAGE == COMMAND_DELETE) deleteQuoteLast();
  else if (MESSAGE.startsWith(`${COMMAND_GET} #`)) deleteQuote();
  else if (MESSAGE === COMMAND_HELP || message.mentions.members.has(getClient().user.id)) sendHelp();
  else ping();

  function sendQuoteRandom() {
    dbQueryItemRandom().then(function(result) {
      message.channel.send(result || CONFIG_FEEDBACK_ERROR.get);
    });
  }

  function addQuote() {
    let quote = MESSAGE.replace(`${COMMAND_ADD} `, '');
    dbInsertItem(quote);
    message.channel.send(`${CONFIG_FEEDBACK_SUCCESS.add}\n→ ${quote}`);
  }

  function deleteQuoteLast() {
    if (checkRights(message.author.id) == true) {
      dbDeleteItemLast().then(function(result) {
        if (result != null) message.channel.send(`${CONFIG_FEEDBACK_SUCCESS.delete}\n→ ${result}`);
        else message.channel.send(CONFIG_FEEDBACK_ERROR.delete);
      });
    }
  }

  function deleteQuote() {
    if (checkRights(message.author.id) == true) {

    }
  }

  function sendHelp() {
    const HELP = CONFIG.help;
    const HELP_USER_TYPE = HELP.user_type;

    message.channel.send(`
${HELP.about}

${HELP_USER_TYPE.user}
• ${HELP.get}: \`${COMMAND_GET}\`
• ${HELP.add}: \`${COMMAND_ADD}\` \`${HELP.add_format}\`

${HELP_USER_TYPE.admin}
• ${HELP.delete}: \`${COMMAND_DELETE}\`

${HELP_USER_TYPE.self}
• \`${COMMAND_HELP}\` or mention me <@!${getClient().user.id}>
    `);

    console.log('Help displayed');
  }

  function ping() {
    if (MESSAGE === '/ping') {
      console.log('Pong');
      message.reply('Pong');
    }
  }

  function checkRights(currentAuthorId) {
    const BOT_ADMIN_IDS = require('./config_private.json').botAdminIds;
    console.log(`Requesting rights...`);
    if (BOT_ADMIN_IDS.includes(currentAuthorId)) {
      console.log(`Success: author id ${currentAuthorId} is a bot admin`);
      return true;
    } else {
      console.log(`Error: ${currentAuthorId} is not a bot admin. Aborting...`);
      message.channel.send(CONFIG_FEEDBACK_ERROR.rights);
      return false;
    }
  }
});
