
const { authSecret } = require('../.env')
const jwt = require('jwt-simple')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation
    const FileCookieStore = require('tough-cookie-filestore2')
    const Instagram = require('instagram-web-api')
   
    const login = async (req, res) => {
        const user = { ...req.body }
        const auth = jwt.decode(user.token, authSecret)
        
        try {
            existsOrError(user.username, 'Usename não informado')
            existsOrError(user.password, 'Senha não informada')

            const userFromDB = await app.db('i_p_models')
                .where({ username: user.username }).first()
            if(!user.id) {
                notExistsOrError(userFromDB, 'Essa conta já esta cadastrada')
            }
        } catch(msg) {
            return res.status(400).json({
                success: false,
                message: msg
            })
        }
        
        let username = req.body.username
        let password = req.body.password
            
        const cookieStore = new FileCookieStore('./sessions/'+username+'.json');
        const client = new Instagram({ username, password, cookieStore})
        
        await client.login().catch(err => {
            console.log(err.error)
            return res.json({
                success: false,
                message: 'aconteu algum problema',
                erro: err.error.message,
                checkpoint: err.error.checkpoint_url
            })
        })
        const ipmodel = {
            username: user.username,
            password: user.password,
            instagram_user_id: '666',
            user_session: '{}',
            user_info: '{}',
            user_id : auth.id,
            active: '2018-11-27 13:35:41',
            proxy: 1,
            status: 1
        }

        app.db('i_p_models')
                .insert(ipmodel)
                .then(_ => res.json({
                    success: true,
                    message: 'aparentemente tudo bem',
                    ipmodes: ipmodel
                }))
                .catch(err => res.status(500).send(err))     
       
    }

    const getChallenge = async (req, res) => {

        let username = req.body.username
        let challengeUrl = req.body.url
        let choice = req.body.choice
   
        const cookieStore = new FileCookieStore('./sessions/'+username+'.json');
        const client = new Instagram({cookieStore})
        const params = await client.getChallenge({ challengeUrl: challengeUrl }).catch(err => {
            console.log(err.error)
            return res.json(err)
        })
        res.json({
            parametros: params
        })
       
    }
    const info = async (req, res) => {
    
        const _token = req.get('Authorization')
        const token  = _token.replace('Bearer ', '')
        
        const auth = jwt.decode(token, authSecret)
        const user = await app.db('users')
            .where({ id: auth.id })
            .first()

        const ipmodel = await app.db('i_p_models')
        .where({ id: user.ip_id })
        .first()

         
        let username = ipmodel.username

         const cookieStore =  new FileCookieStore('./sessions/'+username+'.json')
         const client   = new Instagram({cookieStore})
         const data     = await client.getUserByUsername({username}).catch(err => {
            console.log(err)
            return res.send(err)
        })
         const message = 'WIP'
         return res.json({
         "user": {
            username: data.username,
            usertags_count: message,
            has_anonymous_profile_picture: message,
            media_count: data.edge_owner_to_timeline_media.count,
            hd_profile_pic_versions: message,
            following_count: data.edge_follow.count,
            is_business: data.is_business_account,
            mutual_followers_count: data.edge_mutual_followed_by.count,
            profile_pic_url: data.profile_pic_url,
            biography: data.biography,
            full_name: data.full_name,
            follower_count: data.edge_followed_by.count,
            pk: data.id,
            is_verified: data.is_verified,
            is_private: data.is_private,
            hd_profile_pic_url_info:{
               url: data.profile_pic_url_hd,
               width: 1080,
               height: 1080
            },
            external_url: message
         },
         status: message,
         message: message,
         spam: message,
         lock: message,
         feedback_message: message
       })
    }

    const feed = async (req, res) => {
        const _token = req.get('Authorization')
        const token  = _token.replace('Bearer ', '')
        
        const auth = jwt.decode(token, authSecret)
        
        const user = await app.db('users')
            .where({ id: auth.id })
            .first()

        const ipmodel = await app.db('i_p_models')
        .where({ id: user.ip_id })
        .first()
       
         
        let username = ipmodel.username
    
        const cookieStore =  new FileCookieStore('./sessions/'+username+'.json')
        const client   = new Instagram({cookieStore})
        const data = await client.getUserByUsername({ username: username })
        const timeline = data.edge_owner_to_timeline_media
        const message = 'WIP'
        const valuesArray = []
        //console.log(await client.like({ mediaId: '1938009842712544582' }))
        const photo = 'http://blogs.opovo.com.br/id/wp-content/uploads/sites/61/2018/08/instadivulg.jpg'
        //await client.uploadPhoto({ photo, caption: '❤️' })
        //await client.unlike({ mediaId: '1938009842712544582' })
        for(var i in timeline.edges) {
            const images = []

            for(i2 in timeline.edges[i].node.thumbnail_resources){
                images[i2] = {
                    url: timeline.edges[i].node.thumbnail_resources[i2].src,
                    width: timeline.edges[i].node.thumbnail_resources[i2].config_width,
                    height: timeline.edges[i].node.thumbnail_resources[i2].config_height
                }
            }
            
            valuesArray[i] = {
                taken_at: timeline.edges[i].node.taken_at_timestamp,
                pk: timeline.edges[i].node.id,
                id: timeline.edges[i].node.id+'_'+'user_ID',
                device_timestamp: message,
                media_type: message,
                code: timeline.edges[i].node.shortcode,
                filter_type: message,
                image_versions2:{
                    candidates: images
                }
            }
        }
        
        return res.json({
                  num_results: data.edge_owner_to_timeline_media.count,
                  items: valuesArray,
                  dados: data
                })
    }

    const recentActivity = async (req, res) => {
        const _token = req.get('Authorization')
        const token  = _token.replace('Bearer ', '')
        
        const auth = jwt.decode(token, authSecret)
        
        const user = await app.db('users')
            .where({ id: auth.id })
            .first()
 
        const ipmodel = await app.db('i_p_models')
        .where({ id: user.ip_id })
        .first()
        
        let username = ipmodel.username
    
        const cookieStore =  new FileCookieStore('./sessions/'+username+'.json')
        const client   = new Instagram({cookieStore})
        const data = await client.getActivity()
        const edges = data.activity_feed.edge_web_activity_feed.edges
        const valuesArray = []
        for(var i in edges) {
            let user = edges[i].node.user
            
            let text = ' --- '
            let type = edges[i].node.type
            let media
            if(type == 1){
              text = user.username +' liked your post.'
              let src = 
              media = [{
                    "id": edges[i].node.id,
                    "image": edges[i].node.media.thumbnail_src
              }]
             console.log(edges[i].node.media)
            }
            if(type == 3){
                text = user.username +' started following you.'
            }
        
            valuesArray[i] = {
                "type": edges[i].node.type,
                "story_type":60,
                "args":{
                   "text": text,
                   "links":[
                      {
                         "start":0,
                         "end":14,
                         "type":"user",
                         "id":"287515089"
                      }
                   ],
                   "media_destination":"media?id=1893107699178277622_8403178775",
                   "destination":"media?id=1893107699178277622_8403178775",
                   "profile_id":287515089,
                   "profile_image":user.profile_pic_url,
                   "media": media,
                   "timestamp":1546002684.997211,
                   "tuuid":"141d8f8e-0aa2-11e9-8080-808080808080",
                   "profile_name": user.username
                },
                "counts":{
       
                },
                "pk":"A5g376Z648GWFX+xoF6j5ugIckY="
             }
            //console.log(edges[i])
        }
        return res.status(200).json({
            aymf:[
                edges[1].node.media.thumbnail_src
            ],
            counts: {
                usertags:0,
                comments:0,
                relationships:0,
                campaign_notification:0,
                comment_likes:0,
                likes:0,
                photos_of_you:0,
                requests:0
            },
            friend_request_stories: [],
            new_stories: [],
            old_stories: valuesArray,
            continuation_token: 0,
            subscription: null,
            status: 'ok',
            edges: edges,
            data: data
        })
    }
    
    const validateToken = async (req, res) => {
      
      res.status(200).send({
         "success":true,
         "bots":[
            {
               "follow":null,
               "unfollow":null,
               "like":null
            }
         ]
      })
  }
    return { login, getChallenge, info, feed, recentActivity,validateToken}
}