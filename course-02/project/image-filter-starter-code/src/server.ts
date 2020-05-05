import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {log} from "util";
import https from "https";

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // IT SHOULD
    //    1
    //    1. validate the image_url query
    //    2. call filterImageFromURL(image_url) to filter the image
    //    3. send the resulting file in the response
    //    4. deletes any files on the server on finish of the response
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

    //! END @TODO1
    app.get("/filteredimage", async (req, res) => {
        const image_url = req.param("image_url")
        log(image_url)
        if (!image_url) {
            return res.status(400).send("Missing mandatory parameter")
        }
        try {
            const parsedImgUrl = new URL(image_url)

            https.request(parsedImgUrl).on('response',function (getRes) {
                if(getRes.statusCode != 200){
                    return res.status(404).send("No image found!")
                }else if(getRes.headers['content-type']==null ||
                    !getRes.headers['content-type'].match(/image/)){
                    return res.status(400).send("Content is not image")
                }
            }).on('error', function(get){
                return res.status(500).send("Internal server error")
            }).end()

            const tmpFilePath = await filterImageFromURL(image_url)
            res.on('finish',function(){
                deleteLocalFiles([tmpFilePath])
            })
            res.sendFile(tmpFilePath)
        } catch (e) {
            return res.status(500).send("Internal server error")
        }
    })

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();