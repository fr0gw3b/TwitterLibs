import { log, prompts, chalk } from '../../modules/console'
import * as fs from "fs";
import * as path from 'path';

export async function AccountsToTokens() {
    let folder;
    let filename;
    let filepath;

    let prompt;

    let rawData;
    let accs_data: [];

    try {
        folder = path.join(__dirname, '../../data/');
        filename = `acc_tokens.json`;
        filepath = folder + filename
        
        if (!fs.existsSync(folder))
            await fs.mkdirSync(folder, { recursive: true });

        if(fs.existsSync(filepath)) {
            prompt = await prompts([
                {
                    type: 'confirm',
                    name: 'del_old_accs',
                    message: 'Remove old accounts ?',
                    initial: false
                }
            ]); 
        }

        if(!fs.existsSync(filepath) || prompt?.del_old_accs)
            await fs.writeFileSync(filepath, JSON.stringify({}));

        rawData = await fs.readFileSync(filepath, 'utf-8')
        accs_data = JSON.parse(rawData.toString());
    } catch (Exception: any) {
        return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
    }

    try {
        folder = path.join(__dirname, '../../');
        filename = `accounts.txt`;
        filepath = folder + filename

        if(!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, "");
            throw new Error("The accounts.txt file was not found (-> File created)");
        }

        rawData = await fs.readFileSync(filepath, 'utf-8');
        if(rawData.length < 1) throw new Error("The accounts.txt is empty");
    } catch(Exception: any) {
        return log(chalk.red( `> ❌ ${Exception ? Exception.message : "Error during process"}` ));
    }

    let lines = rawData.toString().replace(/\r/g, '').split('\n');
    
    // Account format : username:password:email?:phone?
    for (let i = 0; i < lines.length; i++) {
        let splitted_lines = lines[i].split(':');
            if(splitted_lines.length < 3) return log(chalk.red( `> ❌ Account line ${i} has a wrong format` ));
        let [username, password, params1 = '', params2 = ''] = splitted_lines;
        let email;
        let phone: string | null = null;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(params1)) {
            email = params1
            if(params2) phone = params2;
        } else {
            phone = params1
        }

        // Vérifier le compte en question

        /** Ajouter le compte en format JSON (!error)
        {
            "username": "",
            "phone": null,
            "password": "",
            "email": "",
            "email_password": "",
            "auth_token": "",
            "csrf_token": "",
            "proxy_type": "",
            "proxies": ",
            "available": true,
            "updated_at": "",
            "user_agent": ""
        }
        */
    }
}