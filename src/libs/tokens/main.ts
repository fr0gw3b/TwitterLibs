import { log, prompts, chalk } from '../../modules/console'
import { Issues } from '../..';
import { AccountsToTokens } from './acc_to_tokens';

export async function Tokens() {
    const response = await prompts({
        type: 'select',
        name: 'scraping_values',
        message: 'Pick a choice',
        choices: [
          { title: 'Accounts to Tokens', description: 'Transform accounts to valide format & check him', value: 'acc_to_tokens' },
          { title: 'Go backwards', value: 'return' },
        ]
    });

    switch(response.scraping_values) {
        case 'acc_to_tokens':
            AccountsToTokens();
            break;

        case 'return':
            Issues()
            break;

        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }

}