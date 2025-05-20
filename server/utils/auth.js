require('dotenv').config();

const axios = require('axios');
const tough = require('tough-cookie');
const { xmlToJson } = require('./XmlToJson');
const ErrorHander = require('./errorHandler');

const axiosCookieJarSupport = require('axios-cookiejar-support').wrapper; // Import the support for axios
axiosCookieJarSupport(axios);

// Mock function to simulate the provider settings function
function getSettingsFromProvider(slug) {
    // For this example, we're returning the provider settings for 'zr_express_new'
    const providers = {
        'ZR Express Stock': {
            slug: 'ZR Express Stock',
            login_url: 'https://procolis.com/PROCLIENT_WEB/FR/Connexion/ZREXPRESS.awp',
            extra: {
                context: 'A4',
                pa3: '1'
            }
        }
    };
    return providers[slug] || null;
}
// Mock function to simulate getting options and logging


exports.auth = async (provider, next) =>  {
    try {
        // Get the provider settings dynamically
        const providerSettings = getSettingsFromProvider(provider.providerName);
        if (!provider) {
            throw new Error('Provider not found');
        }
        const jar = new tough.CookieJar();

        // Create an axios instance with the cookie jar
        const client = axios.create({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Prepare the form data for the request
        const formParams = new URLSearchParams();
        formParams.append('WD_ACTION_', 'AJAXEXECUTE');
        formParams.append('EXECUTEPROCCHAMPS', 'ServeurAPI.API_Connecte');
        formParams.append('WD_CONTEXTE_', providerSettings.extra.context);
        formParams.append('PA1', provider.prenom);
        formParams.append('PA2', provider.password);
        formParams.append('PA3', providerSettings.extra.pa3);

        // Send the POST request
        const response = await client.post(providerSettings.login_url, formParams.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            jar: jar,  
            withCredentials: true,
        });
        const xml = response.data; 
        const apiResponse = xmlToJson(xml); 
        
        const nestedResult = apiResponse.WAJAX.RESULTAT[0];
        if (nestedResult.startsWith("1")) {
            return jar;
        } else if (nestedResult.startsWith("0")) {
            const errorMessage = nestedResult.split(";")[1] || "Unknown error";
            return next(new ErrorHander(`Not Authenticated: ${errorMessage}`, 401));
        } else {
            return next(new ErrorHander(`Something went wrong`, 500));
        }
    } catch (error) {
            return next(new ErrorHander(error.message, 500));
    }
}