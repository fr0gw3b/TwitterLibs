import { log, prompts, chalk } from '../../modules/console'
import { TwitterLibs } from '../TwitterLibs';

export async function Profile_Changer() {

    const client = new TwitterLibs({
        "username": "derin17585",
        "phone": null,
        "password": "440541tpWwu",
        "email": "waffhubenc@hotmail.com",
        "email_password": "ssE9v378",
        "auth_token": "06e600d6946bf36cb219860c791ff8faff97b861",
        "csrf_token": "df26a13bc91db73c56887a9903c5ca3c2b1a08d66aa84d466f6de5c9550baba97a78aad2a4e6587078b137b6fc7888a868a98aef8c92e6f35784712332ccde849584229ee1529f736b05c7f61f32c7dc",
        "proxy_type": "http",
        "proxies": "proxy.digiproxy.cc:8082:lIGRfFHy0B:HMLr4IB1Ua_country-fr",
        "available": true,
        "updated_at": "2023-04-28 13:07:44",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    });

    await client.change_profile_pic({ path: 'logo.jpg' });
}