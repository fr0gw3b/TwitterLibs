import { log, prompts, chalk } from '../../modules/console'
import { Issues } from '../..';

import { Followers } from './followers';
import { Following } from './following';
import { Likers } from './likers';
import { Retweeters } from './retweeters';

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
          { title: 'Likers', description: 'Scrap likers of a tweet', value: 'likers' },
          { title: 'Retweeters', description: 'Scrap retweeters of a tweet', value: 'rt' },
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

        case 'likers':
            Likers();
            break;

        case 'rt':
            Retweeters();
            break;

        case 'return':
            Issues()
            break;

        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }

}