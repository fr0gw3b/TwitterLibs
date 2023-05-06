import { log, prompts, chalk } from '../../modules/console'
import { Issues } from '../..';
import { PrivateDM } from './privatedm';

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export async function advertissing() {
    const response = await prompts({
        type: 'select',
        name: 'scraping_values',
        message: 'Pick a choice',
        choices: [
          { title: 'Private DM', description: 'Send Private Message', value: 'privatedm' },
          { title: 'Go backwards', value: 'return' },
        ]
    });

    switch(response.scraping_values) {
        case 'privatedm':
            console.log("yes");
            PrivateDM();
            break;

        case 'return':
            Issues()
            break;

        default:
            log(chalk.red('What\'s going on..'))
            process.exit();
    }

}