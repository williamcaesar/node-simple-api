


module.exports = app => {

    const FileCookieStore = require('tough-cookie-filestore2')
    const Instagram = require('instagram-web-api')
   
    const login = async (req, res) => {
        
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
        });
          
        return res.json({
            success: true,
            message: 'aparentemente tudo bem'
        })
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
         //estatico para testes
         let username = 'uigormarshall'

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
        let username = 'uigormarshall'
        //const useragentFromSeed = require('useragent-from-seed')
        //const userAgent = useragentFromSeed(username)
        //console.log(userAgent)
        const cookieStore =  new FileCookieStore('./sessions/'+username+'.json')
        const client   = new Instagram({cookieStore})
        const data = await client.getUserByUsername({ username: 'uigormarshall' })
        const timeline = data.edge_owner_to_timeline_media
        const message = 'WIP'
        const valuesArray = []
        console.log(await client.like({ mediaId: '1938009842712544582' }))
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
    return { login, getChallenge, info, feed, validateToken}
}