import { log, prompts, chalk } from '../../modules/console'
import { Issues } from '../..';

import { Profile_Changer } from './profile_changer';

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export async function utilities() {
    const response = await prompts({
        type: 'select',
        name: 'scraping_values',
        message: 'Pick a choice',
        choices: [
          { title: 'Profile Changer', description: 'Change profile info', value: 'p_c' },
          { title: 'Go backwards', value: 'return' },
        ]
    });

    switch(response.scraping_values) {
        case 'p_c':
            Profile_Changer();
            break;

        case 'return':
            Issues()
            break;

        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }

}