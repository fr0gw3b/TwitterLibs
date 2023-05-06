import { log, prompts, chalk } from '../../modules/console'
import { Issues } from '../..';
import { Followers } from './followers';
import { Following } from './following';

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export async function scraping() {
    const response = await prompts({
        type: 'select',
        name: 'scraping_values',
        message: 'Pick a choice',
        choices: [
          { title: 'Followers', description: 'Scrap followers of someone', value: 'followers' },
          { title: 'Following', description: 'Scrap following of someone', value: 'following' },
          { title: 'Go backwards', value: 'return' },
        ]
    });

    switch(response.scraping_values) {
        case 'followers':
            Followers();
            break;

        case 'following':
            Following();
            break;

        case 'return':
            Issues()
            break;

        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }

}