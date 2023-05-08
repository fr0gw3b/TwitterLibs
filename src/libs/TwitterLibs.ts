
import fetch from "node-fetch";
import FormData from 'form-data';
import * as fs from "fs";
import * as path from 'path';
import { log, chalk }  from "../modules/console";
import { HttpsProxyAgent } from "https-proxy-agent";
import got from "got";

export class TwitterLibs {
    private account_data;
    private csrf_token;
    private auth_token;
    private user_agent;
    private proxy;
    private proxy_agent;
    private headers;

    /**
     * TwitterLibs is a class for manage mass twitter account.
     * @param {any} account_data - An object containing various account data
     * @function 
    - follow(name) : Follow the account by Name
    - like_post(tweet_id) : Like a tweet by ID

    - retweet(tweet_id) : Retweet a tweet by ID
    - retweet_with_text(retweet_content, tweet) : Retweet a tweet with message by Link
    - send_dm(message_content, name) : Send a DM with the message content by Name
    
    - followers_scraper(name) : Scrap Followers by Name 
    - following_scraper(name) : Scrap Following by Name

    - likers_scraper(tweet_id) : Scrap Like by ID // Todo (Bugged)
    - retweeters_scraper(tweet_id) : Scrap Retweet by ID  // Todo (Bugged)
    - quoters_scraper(tweet_id) : Scrap Quoters by ID // Todo

    - change_profile_pic(image) : Change Profile Picture
    - change_profile_banner(image) : Change Profile Banner
    - change_account_info(value) : Name, Location Date of Birth and Description
    */
    constructor(account_data: { 
        username: string,
        phone?: string | null,
        password: string,
        email?: string,
        email_password?: string,
        auth_token: string,
        csrf_token: string,
        proxy_type: string,
        proxies: string,
        available?: boolean,
        user_agent: string,
        updated_at?: string,
    }) {
        this.account_data = account_data;

        this.csrf_token = account_data["csrf_token"];
        this.auth_token = account_data["auth_token"];
        this.user_agent = account_data["user_agent"];
        this.proxy = account_data["proxies"].split(":");
        this.proxy_agent = new HttpsProxyAgent(`${account_data['proxy_type']}://${this.proxy[2]}:${this.proxy[3]}@${this.proxy[0]}:${this.proxy[1]}`);

        this.headers = {
            'User-Agent': this.user_agent,
            'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            'x-twitter-auth-type': 'OAuth2Session',
            'x-csrf-token': this.csrf_token,
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary6phexO13QpGyZ8sA',
            'x-twitter-client-language': 'en',
            'x-twitter-active-user': 'yes',
            'Origin': 'https://twitter.com',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Referer': 'https://twitter.com/home',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'TE': 'trailers',
            'Cookie': `ct0=${this.csrf_token}; auth_token=${this.auth_token}`
          };
    }
     
    /**
     * This function retrieves the Twitter user ID of a given username.
     * @param {string} name - The Twitter username (screen name) of the user whose ID is being looked
     * up.
     * @returns the Twitter user ID of the user with the given screen name.
     */
    private async get_id(name: string): Promise<string> {
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://twitter.com/i/api/1.1/users/lookup.json?screen_name=${name}`;

        try {
            const resp = await fetch(url, {
                headers: headers,
                agent: this.proxy_agent
            });
            const data = await resp.json();

            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            return data[0]["id_str"]
        } catch(Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * This is a function that follows a Twitter user by sending a POST request to the
     * Twitter API.
     * @param {string} name - a string representing the username of the Twitter account that the
     * current user wants to follow.
     * @returns either an error message or a success message depending on the outcome of the follow
     * action.
     */
    public async follow(name: string): Promise<void> {
        const user_id = await this.get_id(name);
            if(!user_id) return;
        const headers = {...this.headers};
            headers['content-type'] = "application/json";
        
        const url = `https://twitter.com/i/api/1.1/friendships/create.json`;
        const json_data = {
            'include_profile_interstitial_type': '1',
            'include_blocking': '1',
            'include_blocked_by': '1',
            'include_followed_by': '1',
            'include_want_retweets': '1',
            'include_mute_edge': '1',
            'include_can_dm': '1',
            'include_can_media_tag': '1',
            'include_ext_has_nft_avatar': '1',
            'include_ext_is_blue_verified': '1',
            'include_ext_verified_type': '1',
            'include_ext_profile_image_shape': '1',
            'skip_status': '1',
            'user_id': user_id,
        }

        try {
            const resp = await fetch(url, { headers: headers, body: JSON.stringify(json_data), method: 'POST', agent: this.proxy_agent});
            const data = await resp.json();
            
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            return log(chalk.green(`> [${this.account_data["username"]}] Successfully Follow << ${name} >> ✅`))
        } catch(Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * The function sends a POST request to the Twitter API to like a tweet with a given ID and returns
     * a success message or an error message.
     * @param {string} tweet_id - The ID of the tweet that the user wants to like.
     * @returns a log message indicating whether the tweet was successfully liked or not. If there are
     * errors, it returns a red log message with the error message. If the tweet is successfully liked,
     * it returns a green log message indicating the tweet ID and the username of the account that
     * liked the tweet.
     */
    public async like_post(tweet_id: string): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://api.twitter.com/1.1/favorites/create.json?id=${tweet_id}`;

        try {
            const resp = await fetch(url, { headers: headers, method: 'POST', agent: this.proxy_agent});
            const data = await resp.json();
            
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));
    
            return log(chalk.green(`> [${this.account_data["username"]}] Successfully like the tweet with id ${tweet_id} ✅`))
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * This function retweets a tweet with a given ID using the Twitter API and returns a success or
     * error message.
     * @param {string} tweet_id - The ID of the tweet that needs to be retweeted.
     * @returns a log message indicating whether the retweet was successful or not. If the retweet was
     * successful, it returns a green log message with the tweet ID and the account username. If there
     * was an error during the process, it returns a red log message with the error message or a
     * generic error message if no error message was provided.
     */
    public async retweet(tweet_id: string): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://api.twitter.com/1.1/statuses/retweet/${tweet_id}.json`;

        try {
            const resp = await fetch(url, { headers: headers, method: 'POST', agent: this.proxy_agent});
            const data = await resp.json();
            
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            return log(chalk.green(`> [${this.account_data["username"]}] Successfully Retweet the tweet ${tweet_id} ✅`))
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * This function retweets a tweet with a specified text and link using Twitter's GraphQL API.
     * @param {string} retweet_content - The text content that will be added to the retweet.
     * @param {string} tweet_link - The link to the tweet that you want to retweet with the provided
     * text.
     * @returns a log message indicating whether the retweet was successful or not. If there was an
     * error during the process, it returns an error message.
     */
    public async retweet_with_text(retweet_content: string, tweet_link: string): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://twitter.com/i/api/graphql/7TKRKCPuAGsmYde0CudbVg/CreateTweet`;
        const json_data = {
            'variables': {
                'tweet_text': retweet_content,
                'attachment_url' : tweet_link,
                'dark_request': false,
                'media': {
                    'possibly_sensitive': false,
                },
                'semantic_annotation_ids': [],
            },
            'features': {
                'tweetypie_unmention_optimization_enabled': true,
                'vibe_api_enabled': true,
                'responsive_web_edit_tweet_api_enabled': true,
                'graphql_is_translatable_rweb_tweet_is_translatable_enabled': true,
                'view_counts_everywhere_api_enabled': true,
                'longform_notetweets_consumption_enabled': true,
                'tweet_awards_web_tipping_enabled': false,
                'interactive_text_enabled': true,
                'responsive_web_text_conversations_enabled': false,
                'longform_notetweets_rich_text_read_enabled': true,
                'blue_business_profile_image_shape_enabled': true,
                'responsive_web_graphql_exclude_directive_enabled': true,
                'verified_phone_label_enabled': false,
                'freedom_of_speech_not_reach_fetch_enabled': false,
                'standardized_nudges_misinfo': true,
                'tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled': false,
                'responsive_web_graphql_timeline_navigation_enabled': true,
                'responsive_web_graphql_skip_user_profile_image_extensions_enabled': false,
                'responsive_web_enhance_cards_enabled': false,
            },
            'queryId':'7TKRKCPuAGsmYde0CudbVg',
        }

        try {
            const resp = await fetch(url, { headers: headers, method: 'POST', body: JSON.stringify(json_data), agent: this.proxy_agent});
            const data = await resp.json();
            
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            return log(chalk.green(`> [${this.account_data["username"]}] Successfully Retweet of ${tweet_link} ✅`))
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * This function sends a direct message to a Twitter user using their username and a message.
     * @param {string} name - A string representing the Twitter username of the recipient of the direct
     * message.
     * @param {string} message - The message that will be sent as a direct message to the user
     * specified by their name.
     * @returns either a success message indicating that the message was sent successfully or an error
     * message indicating that there was an error during the process. If there are errors in the
     * response data, the function will return a red error message with the error message from the
     * response data.
     */
    public async send_dm(name: string, message: string): Promise<void> {
        const user_id = await this.get_id(name);
            if(!user_id) return;
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = "https://api.twitter.com/1.1/direct_messages/events/new.json";
        const json_data = {
            'event': {
                'type': 'message_create',
                'message_create': {
                    'target': {
                        'recipient_id': user_id,
                    },
                    'message_data': {
                        'text': message,
                    },
                },
            },
        }
        
        try {
            const resp = await fetch(url, { headers: headers, body: JSON.stringify(json_data),  method: 'POST', agent: this.proxy_agent});
            const data = await resp.json();

            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            switch(data['event']['type']){
                case "message_create":
                    log(chalk.green(`> [${this.account_data["username"]}] Message Sended to ${name} ✅`))
                    break;
                default:
                    log(chalk.green("> ❌ Error : During the process"))
                    break;
            }
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }


    /**
     * This function posts a comment on a tweet using the Twitter API.
     * @param {string} comment_content - The content of the comment that will be posted on Twitter.
     * @param {string} tweet_id - The ID of the tweet that the comment is in reply to.
     * @returns a Promise that resolves to a log message indicating whether the comment was successfully
     * posted or not.
     */
    public async comment_post(comment_content: string, tweet_id: string): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://twitter.com/i/api/graphql/7TKRKCPuAGsmYde0CudbVg/CreateTweet`;
        const json_data = {
            'variables': {
                'tweet_text': comment_content,
                'reply': {
                    'in_reply_to_tweet_id': tweet_id,
                    'exclude_reply_user_ids': [],
                },
                'dark_request': false,
                'media': {
                    'possibly_sensitive': false,
                },
                'semantic_annotation_ids': [],
            },
            'features': {
                'tweetypie_unmention_optimization_enabled': true,
                'vibe_api_enabled': true,
                'responsive_web_edit_tweet_api_enabled': true,
                'graphql_is_translatable_rweb_tweet_is_translatable_enabled': true,
                'view_counts_everywhere_api_enabled': true,
                'longform_notetweets_consumption_enabled': true,
                'tweet_awards_web_tipping_enabled': false,
                'interactive_text_enabled': true,
                'responsive_web_text_conversations_enabled': false,
                'longform_notetweets_rich_text_read_enabled': true,
                'blue_business_profile_image_shape_enabled': true,
                'responsive_web_graphql_exclude_directive_enabled': true,
                'verified_phone_label_enabled': false,
                'freedom_of_speech_not_reach_fetch_enabled': false,
                'standardized_nudges_misinfo': true,
                'tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled': false,
                'responsive_web_graphql_timeline_navigation_enabled': true,
                'responsive_web_graphql_skip_user_profile_image_extensions_enabled': false,
                'responsive_web_enhance_cards_enabled': false,
            },
            'queryId':'7TKRKCPuAGsmYde0CudbVg',
        }

        try {
            const resp = await fetch(url, { headers: headers, method: 'POST', body: JSON.stringify(json_data), agent: this.proxy_agent});
            const data = await resp.json();
            
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));

            return log(chalk.green(`> [${this.account_data["username"]}] Successfully post comment of ${tweet_id} ✅`))
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

    }

    /**
     * This function scrapes a specified number of Twitter user followers and saves their screen names
     * to a text file.
     * @param {string} name - The Twitter username of the account whose followers are being scraped.
     * @param {number} amount - The number of followers to scrape.
     * @param {string} [cursor] - The cursor parameter is used to paginate through the results of the
     * Twitter API request. It is a string that represents the position of the last result returned,
     * and is used to retrieve the next set of results. If no cursor is provided, the function will
     * start at the beginning of the results.
     * @returns It is not clear what is being returned as the code snippet is incomplete and does not
     * include a return statement.
     */
    public async followers_scraper(name: string, amount: number, cursor: string = ""): Promise<void> {
        const user_id = await this.get_id(name);
            if(!user_id) return;
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://twitter.com/i/api/graphql/31HLi-uxjvX3CnJ4TYAetg/Followers`;

        let params;
        let resp;
        let data;

        if(cursor == "") {
            try {
                params = { 
                    variables: '{"userId":"' + user_id + '","count":1,"includePromotedContent":false,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}',
                    features: '{"dont_mention_me_view_api_enabled":true,"interactive_text_enabled":true,"responsive_web_uc_gql_enabled":false,"vibe_tweet_context_enabled":false,"responsive_web_edit_tweet_api_enabled":false,"standardized_nudges_for_misinfo_nudges_enabled":false}',}
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` ));
                if(data.includes('"errors"')) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` ));
                cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]; 
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }
        }

        const now = new Date(),
            year = now.getFullYear(),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0'),
            hours = String(now.getHours()).padStart(2, '0'),
            minutes = String(now.getMinutes()).padStart(2, '0'),
            seconds = String(now.getSeconds()).padStart(2, '0')

        const folder = path.join(__dirname, '../data/scraped/followers/');
        const filename = `${day}-${month}-${year}_${hours}h-${minutes}m-${seconds}s.txt`;
        const filepath = folder + filename

        try {
            if (!fs.existsSync(folder))
                await fs.mkdirSync(folder, { recursive: true });
            await fs.writeFileSync(filepath, "");
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

        let runned = true;
        let written_lines = 0;
        while (runned == true) {
            let file = await fs.readFileSync(filepath, 'utf-8');
            let total = file.split('\n').length

            if(written_lines >= amount) {
                runned = false;
                return log(chalk.green(`> [${this.account_data["username"]}] All accounts has been scraped ✅`))
            }

            try {
                params = { variables: '{"userId":"' + user_id + '","count":100,"cursor":"' + cursor + '","includePromotedContent":false,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}', features: '{"dont_mention_me_view_api_enabled":true,"interactive_text_enabled":true,"responsive_web_uc_gql_enabled":false,"vibe_tweet_context_enabled":false,"responsive_web_edit_tweet_api_enabled":false,"standardized_nudges_for_misinfo_nudges_enabled":false}',}
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` )); }
                if(data.includes('"errors"')) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` )); }
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }

            const screenNames = data.match(/"screen_name":"([^"]+)"/g);
            if (screenNames) {
                let screen_names = screenNames.map(match => "@" + match.split(":")[1].replace(/"/g, "")).join("\n");
                let screen_names_lines = screen_names.trim().split('\n').length;
        
                if (written_lines + screen_names_lines > amount) {
                    let lines_remaining = amount - written_lines;

                    try {
                        fs.appendFileSync(filepath, screen_names.trim().split('\n').slice(0, lines_remaining).join('\n') + '\n');
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }

                    written_lines += lines_remaining;
                } else {
                    try {
                        fs.appendFileSync(filepath, screen_names);
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }
                    written_lines += screen_names_lines;
                    
                    cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]
                    log(chalk.green(`> [${this.account_data["username"]}] You scraped ${total}/${amount} accounts - cursor: ${cursor} ✅`))
                }
                
            }
        }
    }

    /**
     * This function scrapes a specified number of Twitter user's followings and saves their screen
     * names to a text file.
     * @param {string} name - The Twitter username of the account whose followings you want to scrape.
     * @param {number} amount - The amount parameter is the maximum number of Twitter accounts to be
     * scraped.
     * @param {string} [cursor] - The cursor parameter is used to paginate through the list of
     * followings being scraped. It is initially set to an empty string, and then updated with each
     * request to the API to retrieve the next batch of followings.
     * @returns The code snippet does not have a return statement. It contains an asynchronous function
     * that performs web scraping of Twitter accounts that a user is following and writes the screen
     * names to a text file.
     */
    public async followings_scraper(name: string, amount: number, cursor: string = ""): Promise<void> {
        const user_id = await this.get_id(name);
            if(!user_id) return;
        const headers = {...this.headers};
            headers['content-type'] = "application/json";

        const url = `https://twitter.com/i/api/graphql/HExDl7BP0vveZdICk4d2ZA/Following`;

        let params;
        let resp;
        let data;

        if(cursor == "") {
            try {
                params = {
                    variables: '{"userId":"' + user_id + '","count":1,"includePromotedContent":false}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}'
                };
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` ));
                if(data.includes('"errors"')) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` ));
                cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]; 
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }
        }

        const now = new Date(),
            year = now.getFullYear(),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0'),
            hours = String(now.getHours()).padStart(2, '0'),
            minutes = String(now.getMinutes()).padStart(2, '0'),
            seconds = String(now.getSeconds()).padStart(2, '0')

        const folder = path.join(__dirname, '../data/scraped/followings/');
        const filename = `${day}-${month}-${year}_${hours}h-${minutes}m-${seconds}s.txt`;
        const filepath = folder + filename

        try {
            if (!fs.existsSync(folder))
                await fs.mkdirSync(folder, { recursive: true });
            await fs.writeFileSync(filepath, "");
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

        let runned = true;
        let written_lines = 0;
        while (runned == true) {
            let file = await fs.readFileSync(filepath, 'utf-8');
            let total = file.split('\n').length

            if(written_lines >= amount) {
                runned = false;
                return log(chalk.green(`> [${this.account_data["username"]}] All accounts has been scraped ✅`))
            }

            try {
                params = {
                    variables: '{"userId":"' + user_id + '","count":100,"cursor":"' + cursor + '","includePromotedContent":false,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}'
                };
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` )); }
                if(data.includes('"errors"')) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` )); }
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }

            const screenNames = data.match(/"screen_name":"([^"]+)"/g);
            if (screenNames) {
                let screen_names = screenNames.map(match => "@" + match.split(":")[1].replace(/"/g, "")).join("\n");
                let screen_names_lines = screen_names.trim().split('\n').length;
        
                if (written_lines + screen_names_lines > amount) {
                    let lines_remaining = amount - written_lines;

                    try {
                        fs.appendFileSync(filepath, screen_names.trim().split('\n').slice(0, lines_remaining).join('\n') + '\n');
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }

                    written_lines += lines_remaining;
                } else {
                    try {
                        fs.appendFileSync(filepath, screen_names);
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }
                    written_lines += screen_names_lines;
                    
                    cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]
                    log(chalk.green(`> [${this.account_data["username"]}] You scraped ${total}/${amount} accounts - cursor: ${cursor} ✅`))
                }
                
            }
        }
    }

    /**
     * This function scrapes Twitter accounts that have liked a specific tweet.
     * @param {string} tweet_id - The ID of the tweet for which you want to scrape the likers.
     * @param {number} amount - The number of likers to scrape from the tweet.
     * @param {string} [cursor] - The cursor parameter is used to paginate through the results of the
     * Twitter API request. It is a string that represents the position of the last result returned,
     * allowing the next set of results to be retrieved.
     * @returns It is not clear what is being returned as there are multiple return statements in the
     * code and it depends on which one is executed.
     */
    public async likers_scraper(tweet_id: string, amount: number, cursor: string = ""): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = 'application/json';

        const url = `https://twitter.com/i/api/graphql/chZuj2D-EyT1GapXpQrUnQ/Favoriters`;

        let resp;
        let data;
        let params;

        if(cursor == "") {
            try {
                params = {
                    variables: '{"tweetId":"' + tweet_id + '","count":1,"includePromotedContent":false}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}'
                }
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` ));
                if(data.includes('"errors"')) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` ));
                cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0];
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }
        }

        try {
            params = {
                variables: '{"tweetId":"' + tweet_id + '","count":20,"cursor":"' + cursor + '","includePromotedContent":false}',
                features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}'
            }
            console.log(params)
            resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
            data = await resp.text();
            if(!data) { return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` )); }
            if(data.includes('"errors"')) { return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` )); }
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

        const now = new Date(),
            year = now.getFullYear(),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0'),
            hours = String(now.getHours()).padStart(2, '0'),
            minutes = String(now.getMinutes()).padStart(2, '0'),
            seconds = String(now.getSeconds()).padStart(2, '0')

        const folder = path.join(__dirname, '../data/scraped/likers/');
        const filename = `${day}-${month}-${year}_${hours}h-${minutes}m-${seconds}s.txt`;
        const filepath = folder + filename
        /**
        try {
            if (!fs.existsSync(folder))
                await fs.mkdirSync(folder, { recursive: true });
            await fs.writeFileSync(filepath, "");
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

        let runned = true;
        let written_lines = 0;
        while (runned == true) {
            let file = await fs.readFileSync(filepath, 'utf-8');
            let total = file.split('\n').length

            if(written_lines >= amount) {
                runned = false;
                return log(chalk.green(`> [${this.account_data["username"]}] All accounts has been scraped ✅`))
            }

            try {
                params = {
                    variables: '{"tweetId":"' + tweet_id + '","count":100,"cursor":"' + cursor + '","includePromotedContent":false}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}'
                }
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers })
                data = await resp.text();
                if(!data) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` )); }
                if(data.includes('"errors"')) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` )); }
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }

            const screenNames = data.match(/"screen_name":"([^"]+)"/g);
            if (screenNames) {
                let screen_names = screenNames.map(match => "@" + match.split(":")[1].replace(/"/g, "")).join("\n");
                let screen_names_lines = screen_names.trim().split('\n').length;
        
                if (written_lines + screen_names_lines > amount) {
                    let lines_remaining = amount - written_lines;

                    try {
                        fs.appendFileSync(filepath, screen_names.trim().split('\n').slice(0, lines_remaining).join('\n') + '\n');
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }

                    written_lines += lines_remaining;
                } else {
                    try {
                        fs.appendFileSync(filepath, screen_names);
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }
                    written_lines += screen_names_lines;
                    
                    cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]
                    log(chalk.green(`> [${this.account_data["username"]}] You scraped ${total}/${amount} accounts - cursor: ${cursor} ✅`))
                }
            }
        } */
    }

    /**
     * This function scrapes retweeters of a given tweet and saves their screen names to a file.
     * @param {string} tweet_id - The ID of the tweet for which you want to scrape the retweeters.
     * @param {number} amount - The number of retweeters to scrape.
     * @param {string} [cursor] - The cursor parameter is used to paginate through the results of the
     * retweeters_scraper function. It is initially set to an empty string, and then updated with each
     * request to the Twitter API to retrieve the next set of retweeters. This allows the function to
     * retrieve a large number of retwe
     * @returns It is not clear what is being returned as there are multiple return statements within
     * the function and it depends on the specific execution path that is taken.
     */
    public async retweeters_scraper(tweet_id: string, amount: number, cursor: string = ""): Promise<void> {
        const headers = {...this.headers};
            headers['content-type'] = 'application/json';

        const url = `https://twitter.com/i/api/graphql/g2ePSCh-xWUiS_vH03Mn7A/Retweeters`;

        let resp;
        let data;
        let params;
    
        if(cursor == "") {
            try {
                params = {
                    variables: '{"tweetId":"' + tweet_id + '","count":1,"includePromotedContent":false}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}',
                }
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` ));
                if(data.includes('"errors"')) return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` ));
                cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]; 
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }
        }
            
        const now = new Date(),
            year = now.getFullYear(),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0'),
            hours = String(now.getHours()).padStart(2, '0'),
            minutes = String(now.getMinutes()).padStart(2, '0'),
            seconds = String(now.getSeconds()).padStart(2, '0')
    
        const folder = path.join(__dirname, '../data/scraped/retweeters/');
        const filename = `${day}-${month}-${year}_${hours}h-${minutes}m-${seconds}s.txt`;
        const filepath = folder + filename
    
        try {
            if (!fs.existsSync(folder))
                await fs.mkdirSync(folder, { recursive: true });
            await fs.writeFileSync(filepath, "");
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }

        let runned = true;
        let written_lines = 0;
        while (runned == true) {
            let file = await fs.readFileSync(filepath, 'utf-8');
            let total = file.split('\n').length

            if(written_lines >= amount) {
                runned = false;
                return log(chalk.green(`> [${this.account_data["username"]}] All accounts has been scraped ✅`))
            }

            try {
                params = {
                    variables: '{"tweetId":"' + tweet_id + '","count":20,"cursor":"' + cursor + '","includePromotedContent":false}',
                    features: '{"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":false,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false,"dont_mention_me_view_api_enabled":true,"vibe_tweet_context_enabled":false,"standardized_nudges_for_misinfo_nudges_enabled":false}',
                }
                resp = await fetch(url + '?' + new URLSearchParams(params), { headers: headers, agent: this.proxy_agent })
                data = await resp.text();
                if(!data) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error during process` )); }
                if(data.includes('"errors"')) { runned = false; return log(chalk.red( `> ❌ [${this.account_data["username"]}] Error in response : ${data}` )); }
            } catch (Exception: any) {
                return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
            }


            const screenNames = data.match(/"screen_name":"([^"]+)"/g);
            if (screenNames) {
                let screen_names = screenNames.map(match => "@" + match.split(":")[1].replace(/"/g, "")).join("\n");
                let screen_names_lines = screen_names.trim().split('\n').length;
        
                if (written_lines + screen_names_lines > amount) {
                    let lines_remaining = amount - written_lines;

                    try {
                        fs.appendFileSync(filepath, screen_names.trim().split('\n').slice(0, lines_remaining).join('\n') + '\n');
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }

                    written_lines += lines_remaining;
                } else {
                    try {
                        fs.appendFileSync(filepath, screen_names);
                    } catch (err) {
                        console.error(`Error appending screen names to the file ${file}: ${err}`);
                    }
                    written_lines += screen_names_lines;
                    
                    cursor = data.split('"TimelineTimelineCursor","value":"')[1].split('"')[0]
                    log(chalk.green(`> [${this.account_data["username"]}] You scraped ${total}/${amount} accounts - cursor: ${cursor} ✅`))
                }
                
            }
        }
    }


    /**
     * This is a function that updates a Twitter account's profile information using the
     * Twitter API.
     * @param updates - An object containing optional properties for updating the user's account
     * information. The properties include birthdate_day, birthdate_month, birthdate_year, name,
     * description, and location.
     * @returns a Promise that resolves to a log message indicating whether the account info has been
     * successfully updated or if there was an error during the process.
     */
    public async change_account_info(updates: { 
        birthdate_day?: string,
        birthdate_month?: string,
        birthdate_year?: string,
        name?: string,
        description?: string,
        location?: string
    }): Promise<void> {
        const headers = {...this.headers};
        const url = `https://api.twitter.com/1.1/account/update_profile.json?` + new URLSearchParams(updates);

        let resp;
        let data;

        try {
            resp = await fetch(url, { headers: headers, method: 'POST', agent: this.proxy_agent })
            data = await resp.json();
            if(!data || data["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + data? data["errors"][0]["message"] : "Error during process" ));
            return log(chalk.green(`> [${this.account_data["username"]}] Account info has been updated ✅`))
        } catch (Exception: any) {
            return log(chalk.red( "> ❌ " + Exception ? Exception : "Error during process" ));
        }
    }

    /**
     * This function reads a chunk of data from a stream asynchronously and returns a promise that
     * resolves with the chunk.
     * @param {any} stream - The stream parameter is an object that represents a readable stream of
     * data. It could be a file stream, network stream, or any other type of stream that emits data
     * events.
     * @param {any} size - The size parameter is the number of bytes to read from the stream.
     * @returns The function `readChunk` returns a Promise that resolves to a Buffer containing the
     * specified number of bytes read from the input stream.
     */
    private async readChunk(stream: any, size: any) {
        return new Promise((resolve, reject) => {
          const buffer = Buffer.alloc(size);
          let pos = 0;
      
          stream.on('error', reject);
          stream.on('end', () => {
            resolve(buffer.slice(0, pos));
          });
          stream.on('readable', () => {
            let chunk;
            while ((chunk = stream.read(Math.min(size - pos, 1024 * 1024)))) {
              chunk.copy(buffer, pos);
              pos += chunk.length;
              if (pos === size) {
                resolve(buffer);
              }
            }
          });
        });
    }

    /**
     * This function appends a chunk of media to a Twitter upload using multipart/form-data.
     * @param {string} mediaId - A string representing the unique identifier for the media being
     * uploaded.
     * @param {any} media - The binary data of the media file being uploaded. It is passed as the
     * second argument to the function.
     * @param {number} segmentIndex - The segment index is the index of the media segment being
     * uploaded in a chunked upload. In a chunked upload, large media files are split into smaller
     * segments and uploaded one at a time. The segment index indicates the order in which the segments
     * should be appended to the media file on the server.
     */
    private async chunkedUploadAppend(mediaId: string, media: any, segmentIndex: number) {
        const formData = new FormData();
            formData.append('media', media, { contentType: 'application/octet-stream' });
      
        const headers = { ...this.headers };
            headers['content-type'] = `multipart/form-data; boundary=${formData.getBoundary()}`;

        await fetch(`https://upload.twitter.com/i/media/upload.json?command=APPEND&media_id=${mediaId}&segment_index=${segmentIndex}`,
            {
              method: 'POST',
              headers: {
                ...headers
              },
              body: formData,
              agent: this.proxy_agent
            }
        );
    }

    /**
     * This function finalizes a chunked media upload on Twitter.
     * @param {string} mediaId - The mediaId parameter is a string that represents the unique
     * identifier for the media file being uploaded to Twitter. It is used to track the progress of the
     * upload and to perform various operations on the media file, such as finalizing the upload or
     * appending additional chunks of data.
     * @returns the JSON response from the Twitter API after making a POST request to finalize a
     * chunked media upload with the specified media ID.
     */
    private async chunkedUploadFinalize(mediaId: string) {
        const headers = {...this.headers};

        let resp = await fetch(
          `https://upload.twitter.com/i/media/upload.json?command=FINALIZE&media_id=${mediaId}`,
          {
            method: 'POST',
            headers: {
              ...headers
            },
            agent: this.proxy_agent
          }
        ).then(res => res.json());

        return resp;
    }

    /**
     * This function uploads a new profile picture for a Twitter account using chunked uploading.
     * @param image - The image parameter is an object that contains the path of the image file to be
     * uploaded as the profile picture.
     * @returns a Promise that resolves to a log message indicating whether the account avatar has been
     * updated successfully or an error message if there was an error during the process.
     */
    public async change_profile_pic(image: { path: string }) {
        let headers = {...this.headers};
        let resp;
        
        const imagePath = path.join(__dirname, '../' + image.path);
        const fileStream = fs.createReadStream(imagePath);

        const stat = fs.statSync(imagePath);
        const fileSize = stat.size;

        resp = await fetch(
            `https://upload.twitter.com/i/media/upload.json?command=INIT&total_bytes=${fileSize}&media_type=image%2Fjpeg`,
            {
                method: 'POST',
                headers: {
                    ...headers,
                },
                agent: this.proxy_agent
            }
        ).then((res) => res.json());
            
        if(resp.media_id_string) {
            const mediaId = resp.media_id_string;
                
            const minChunckSize = Math.ceil(fileSize / 1000);
            const chunkSize = Math.max(minChunckSize, 1024 * 1024);
            const segments = Math.ceil(fileSize / chunkSize);

            for (let segmentIndex = 0; segmentIndex < segments; segmentIndex++) {
                const chunk = await this.readChunk(fileStream, chunkSize);
                await this.chunkedUploadAppend(mediaId, chunk, segmentIndex);
            }

            resp = await this.chunkedUploadFinalize(mediaId);
            if(!resp || resp["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + resp ? resp["errors"][0]["message"] : "Error during process" ));
                
            resp = await fetch(
                'https://api.twitter.com/1.1/account/update_profile_image.json?media_id=' + mediaId,
                {
                    method: 'POST',
                    headers: {
                        ...headers
                    },
                    agent: this.proxy_agent
                }
            ).then((res) => res.json());

            if(!resp || resp["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + resp ? resp["errors"][0]["message"] : "Error during process" ));
              
            return log(chalk.green(`> [${this.account_data["username"]}] Account Avatar has been updated ✅`))
        } else {
            return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] Error specify a path" ));
        }
    }

    /**
     * This function uploads and sets a new profile banner image for a Twitter account.
     * @param image - The image parameter is an object that contains the path of the image file to be
     * uploaded for changing the profile banner.
     * @returns a log message indicating whether the profile banner update was successful or not. If
     * successful, it logs a green message saying "Account Avatar has been updated ✅". If there was an
     * error during the process, it logs a red message with the error message.
     */
    public async change_profile_banner(image: { path: string }) {
        let headers = {...this.headers};
        let resp;
        
        const imagePath = path.join(__dirname, '../' + image.path);
        const fileStream = fs.createReadStream(imagePath);

        const stat = fs.statSync(imagePath);
        const fileSize = stat.size;

        resp = await fetch(
            `https://upload.twitter.com/i/media/upload.json?command=INIT&total_bytes=${fileSize}&media_type=image%2Fjpeg`,
            {
                method: 'POST',
                headers: {
                    ...headers,
                },
                agent: this.proxy_agent
            }
        ).then((res) => res.json());
        
        if(resp.media_id_string) {
            const mediaId = resp.media_id_string;
                
            const minChunckSize = Math.ceil(fileSize / 1000);
            const chunkSize = Math.max(minChunckSize, 1024 * 1024);
            const segments = Math.ceil(fileSize / chunkSize);

            for (let segmentIndex = 0; segmentIndex < segments; segmentIndex++) {
                const chunk = await this.readChunk(fileStream, chunkSize);
                await this.chunkedUploadAppend(mediaId, chunk, segmentIndex);
            }

            resp = await this.chunkedUploadFinalize(mediaId);
            if(!resp || resp["errors"])
                return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] " + resp ? resp["errors"][0]["message"] : "Error during process" ));
                
            resp = await fetch(
                'https://api.twitter.com/1.1/account/update_profile_banner.json?media_id=' + mediaId,
                {
                    method: 'POST',
                    headers: {
                        ...headers
                    },
                    agent: this.proxy_agent
                }
            );

            switch (resp.status) {
                case 400:
                    log(chalk.green(`> ❌ [${this.account_data["username"]}] Error : Either an image was not provided, or the image data could not be processed`))
                    break;
                case 422:
                    log(chalk.green(`> ❌ [${this.account_data["username"]}] Error : The image could not be resized, or is too large`))
                    break;
                default:
                    log(chalk.green(`> [${this.account_data["username"]}] Account Avatar has been updated ✅`));
                    break;
            }
        } else {
            return log(chalk.red( "> ❌ [" + this.account_data["username"] + "] Error : " + resp ? resp : "Error during retrieve media id" ));
        }
    }

}