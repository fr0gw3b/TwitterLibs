import { log, prompts, chalk } from './modules/console'
import { scraping } from './libs/scraping/main';
import { advertissing } from './libs/advertissing/main';

async function start() {
    log(chalk.green(`   ________  __       __  ______  ________  ________  ________  _______          ______   ______   ______  
 /        |/  |  _  /  |/      |/        |/        |/        |/       \        /      \ /      | /      \ 
 $$$$$$$$/ $$ | / \ $$ |$$$$$$/ $$$$$$$$/ $$$$$$$$/ $$$$$$$$/ $$$$$$$  |      /$$$$$$  |$$$$$$/ /$$$$$$  |
    $$ |   $$ |/$  \$$ |  $$ |     $$ |      $$ |   $$ |__    $$ |__$$ |      $$ |__$$ |  $$ |  $$ |  $$ |
    $$ |   $$ /$$$  $$ |  $$ |     $$ |      $$ |   $$    |   $$    $$<       $$    $$ |  $$ |  $$ |  $$ |
    $$ |   $$ $$/$$ $$ |  $$ |     $$ |      $$ |   $$$$$/    $$$$$$$  |      $$$$$$$$ |  $$ |  $$ |  $$ |
    $$ |   $$$$/  $$$$ | _$$ |_    $$ |      $$ |   $$ |_____ $$ |  $$ |      $$ |  $$ | _$$ |_ $$ \__$$ |
    $$ |   $$$/    $$$ |/ $$   |   $$ |      $$ |   $$       |$$ |  $$ |      $$ |  $$ |/ $$   |$$    $$/ 
    $$/    $$/      $$/ $$$$$$/    $$/       $$/    $$$$$$$$/ $$/   $$/       $$/   $$/ $$$$$$/  $$$$$$/  v1.0.0
        By Frog`))

    log('Using Proxies : ' + chalk.blue('Yes'));

    Issues();
}

export async function Issues() {
    const response = await prompts({
        type: 'select',
        name: 'issues_values',
        message: 'Pick a choice',
        choices: [
          { title: 'Tokens', description: 'Check your tokens', value: 'tokens' },
          { title: 'Scraping', description: 'Followers, Following, Likers, Retweeters', value: 'scraping' },
          { title: 'Advertissing', description: 'Mass Mentioning, DM', value: 'advertissing' },
          { title: 'Engagement', description: 'Mass Liking, Retweeting, Following', value: 'engagement' },
          { title: 'Utilities', description: 'Some tools ', value: 'utilities' },
          { title: 'Exit', value: 'exit' },
        ]
    });

    switch (response.issues_values)
    {
        case 'tokens':
            break;

        case 'scraping':
            scraping();
            break;

        case 'advertissing':
            advertissing();
            break;

        case 'engagement':
            break;

        case 'utilities':
            break;

        case 'exit':
            log(chalk.green('Have a good trip 👋'))
            process.exit()
        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }
}

start()