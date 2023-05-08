import { log, prompts, chalk } from '../../modules/console'
import { TwitterLibs } from '../TwitterLibs';

export async function Profile_Changer() {

    const client = new TwitterLibs({
        "username": "derin17585",
        "phone": null,
        "password": "440541tpWwu",
        "email": "waffhubenc@hotmail.com",
        "email_password": "ssE9v378",
        "auth_token": "d1642119799d6cdadca21d7b1f34214194c50651",
        "csrf_token": "d2d5224ddea6a6fc0837a7960c5b959946131595635662575f62b94a46ee3fcff16eabd509f2d40ca0daeeecbceec8d29d67e581f4be0b26c324a867f0401d7ae511878e4198acb18bfced3b852eeb79",
        "proxy_type": "http",
        "proxies": "proxy.digiproxy.cc:8082:lIGRfFHy0B:HMLr4IB1Ua_country-fr",
        "available": true,
        "updated_at": "2023-04-28 13:07:44",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    });

    await client.change_account_info({ name: "Fr0g", description: "Frog the best?" });
}