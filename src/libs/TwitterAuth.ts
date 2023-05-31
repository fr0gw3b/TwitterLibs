import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from "https-proxy-agent";

export class TwitterAuth {

    private account_data;
    private csrf_token;
    private proxy;
    private proxy_agent: any;

    private guest_token: any;
    private flow_token: any;
    
    constructor(account: { 
        username: string,
        password: string, 
        email?: string,
        phone?: string,
        proxy_type?: string,
        proxies?: string
    }) {
        this.account_data =  account;
        this.csrf_token = crypto.randomBytes(16).toString('hex');
        
        this.proxy = account.proxies?.split(":");
        if(this.proxy) this.proxy_agent = new HttpsProxyAgent(`${this.account_data["proxy_type"]}://${this.proxy[2]}:${this.proxy[3]}@${this.proxy[0]}:${this.proxy[1]}`);
    }

    private async get_guest_token() {
        let headers = {
            'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            'x-csrf-token': this.csrf_token
        }

        let url = `https://api.twitter.com/1.1/guest/activate.json`;
        return await fetch(url, { headers: headers, method: 'POST'  })
    }

    private async get_login_flow_token() {}

    private async send_ref_flow_token() {}

    private async send_identity() {}

    private async send_password() {}

    private async account_duplication_check() {}

    private async login_acid() {}

    public async login() {
        let response;
        let data;

        response = await this.get_guest_token();
        data = await response.json();
        console.log(data)
    }

} 