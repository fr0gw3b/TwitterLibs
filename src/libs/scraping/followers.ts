import { log, prompts, chalk } from '../../modules/console'
import { TwitterLibs } from '../TwitterLibs';

export async function Followers() {
    const response = await prompts([
        {
            type: 'text',
            name: 'username',
            message: 'Choice the username you want scrap followers'
        },
        {
            type: 'text',
            name: 'amount',
            message: 'Choice the amount you want to scrap'
        },
    ]);

    const client = new TwitterLibs({
        "username": "derin17585",
        "phone": null,
        "password": "440541tpWwu",
        "email": "waffhubenc@hotmail.com",
        "email_password": "ssE9v378",
        "auth_token": "ed7760a73701169e0e950bda4b385702570e8dbe",
        "csrf_token": "d1d7da0cea7039504646a8195091d6d1",
        "proxy_type": "http",
        "proxies": "proxy.digiproxy.cc:8082:lIGRfFHy0B:HMLr4IB1Ua_country-fr",
        "available": true,
        "updated_at": "2023-04-28 13:07:44",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    });

    await client.followers_scraper(response.username, response.amount);
}