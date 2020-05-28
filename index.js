import 'node-libs-react-native/globals';

import { AsyncStorage } from 'react-native'
import device from './src/util/device';
import AppInfo from './src/module/app/AppInfo';
import theme from './src/util/Theme';
import network from './src/module/common/network';


import { NETWORK_ENV_MAINNET } from './src/config/const';
import detectionRisk from './src/module/app/DetectionRisk'
import logger from './src/util/logger';

import i18n from './src/module/i18n/i18n';
import launch from './src/module/launch/launch';
import { Navigation } from 'react-native-navigation';
import RiskWarningScreen from './src/page/RiskWarningScreen';
import * as Keychain from 'react-native-keychain';

logger.start()
console.disableYellowBox = true; // 忽略控制台黄色警告

start()

async function start() {

    const username = 'zuck';
    const password = 'poniesRgr8';

    // Store the credentials
    // await Keychain.setGenericPassword(username, password);

    try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
            console.log(
                'Credentials successfully loaded for user ' + credentials.username, credentials
            );
        } else {
            await Keychain.setGenericPassword(username, password);
            console.log('No credentials stored');
        }
    } catch (error) {
        console.log("Keychain couldn't be accessed!", error);
    }
    // await Keychain.resetGenericPassword();

    if (!detectionRisk()) {
        const env = NETWORK_ENV_MAINNET
        network.env = env

        await Promise.all([device.installID(), i18n.setup()])

        const AccountStore = require('./src/module/wallet/account/AccountStore').default
        const DeviceSecurity = require('./src/module/security/DeviceSecurity').default
        Promise.all([AccountStore.setup(env), DeviceSecurity.setup()]).then(async () => {
            require('./src/page/rrwalletRegisterScreens').registerScreens()
            launch({ appStyle })
        })
    } else {
        launcRiskModel()
    }
}

async function launcRiskModel() {
    const AccountStore = require('./src/module/wallet/account/AccountStore').default
    await AccountStore.setup(NETWORK_ENV_MAINNET)
    Navigation.registerComponent(RiskWarningScreen.screenID, () => RiskWarningScreen);
    Navigation.startSingleScreenApp({
        screen: {
            screen: RiskWarningScreen.screenID
        }
    })
}

const appStyle = {
    orientation: 'portrait',
    hideBackButtonTitle: true,
    keepStyleAcrossPush: false,
    backButtonImage: require('@img/nav/nav-back.png')
}