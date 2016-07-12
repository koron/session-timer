import React, { Component } from 'react'
import {
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Modal from 'react-native-modalbox'
import CircularTimer from '../components/circular-timer'
import Copyright from '../components/copyright'
import Device from '../lib/device'
import NotificatableTimer from '../../domain/notification-timer'
import presets from '../../domain/presets'

const FPS = 60

function zeroPadding (n) {
    return ('0' + n.toString()).slice(-2)
}

const base = Device.shorter
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: '#eeeeee',
    },
    timer: {
        flex: 4,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    icon: {
        top: base / 4.0,
        alignSelf: 'center',
        textAlign: 'center',
    },
    text: {
        top: -(base / 2),
        fontFamily: 'avenir',
        fontSize: base / 5,
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
    },
    button: {
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        flex: 1,
    },
    resetButton: {
        height: 100,
        paddingTop: 20,
        textAlign: 'center',
        color: '#eeeeee',
        fontSize: 40,
        fontFamily: 'avenir',
        fontWeight: 'bold',
    },
    toggleButton: {
        height: 100,
        paddingTop: 20,
        textAlign: 'center',
        color: '#eeeeee',
        fontSize: 40,
        fontFamily: 'avenir',
        fontWeight: 'bold',
    },
    header: {
        top: 20,
        flex: 0.56,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    copyright: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    copyrightButton: {
        width: 90,
        backgroundColor: '#444',
        borderRadius: 36,
        right: 36,
    },
    logo: {
        alignSelf: 'center',
        width: 50,
        height: 50,
        left: 18,
    },
    preset: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    presetButton: {
        width: 180,
        height: 50,
        backgroundColor: '#444',
        borderRadius: 36,
        left: 36,
    },
    presetText: {
        alignSelf: 'center',
        fontFamily: 'avenir',
        color: '#fff',
        fontSize: 32,
        right: 18,
        height: 50,
    },
    modal: {
        height: 300,
        width: 300,
        borderRadius: 16,
    },
})

export default class App extends Component {
    constructor (props) {
        super(props)
        this.index = 0
        this.presets = presets.map((preset) => {
            const original = preset.terminateCallback
            preset.terminateCallback = () => {
                original()
                this.stop()
                this.props.actions.terminate()
            }
            return preset
        })
        this.timer = new NotificatableTimer(this.presets[this.index])
    }

    start () {
        this.timer.start()
        const { actions } = this.props
        actions.start()
        this.intervalId = setInterval(() => actions.sync(this.timer), 1000 / FPS)
    }

    stop () {
        this.timer.stop()
        this.props.actions.stop()
        clearInterval(this.intervalId)
    }

    reset() {
        this.props.actions.reset()
        this.timer.reset()
    }

    togglePresets() {
        ++this.index
        if (this.presets.length <= this.index) {
            this.index = 0
        }
        this.timer = new NotificatableTimer(this.presets[this.index])
        const { actions } = this.props
        actions.reset()
        actions.sync(this.timer)
    }

    showCopyright() {
        this.refs.copyright.open()
    }

    get iconName () {
        return this.props.state.isRunning ? 'play': 'pause'
    }
    get iconColor () {
        return this.props.state.isRunning ? '#222222' : '#777777'
    }
    get textColor () {
        return this.props.state.isRunning ? '#222222' : '#777777'
    }
    get resetButtonColor () {
        return this.props.state.isRunning ? '#aaaaaa' : '#555555'
    }
    get toggleButtonColor () {
        return this.props.state.isReady
            ? this.props.state.isRunning ? '#ea5432' : '#5db7e8'
            : '#aaaaaa'
    }
    get toggleButtonText () {
        return this.props.state.isRunning ? 'Stop': 'Start'
    }

    get remainingText () {
        const { state } = this.props
        const total = this.timer.total
        const progress = state.progress
        const remaining = (total * (1 - progress)) / 1000
        const remainingMinutes = Math.floor(remaining / 60)
        const remainingSeconds = Math.floor(remaining % 60)
        return zeroPadding(remainingMinutes) + ':' + zeroPadding(remainingSeconds)
    }

    render () {
        const { state, actions } = this.props
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.copyright}>
                        <TouchableWithoutFeedback
                            activeOpacity={1}
                            onPress={() => this.showCopyright()}
                        >
                            <View style={styles.copyrightButton}>
                                <Image source={{uri: 'hex_logo'}} style={styles.logo} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.preset}>
                        <TouchableWithoutFeedback
                            activeOpacity={1}
                            onPress={() => {state.isRunning || this.togglePresets()}}>
                            <View style={styles.presetButton}>
                                <Text style={styles.presetText}>Preset</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={styles.timer}>
                    <Text style={styles.icon}>
                        <Icon
                            name={this.iconName}
                            size={base / 6.5}
                            color={this.iconColor}
                        />
                    </Text>
                    <CircularTimer
                        total={this.timer.total}
                        progress={state.progress}
                        isRunning={state.isRunning}
                    />
                    <Text style={[styles.text, {color: this.textColor}]}>{this.remainingText}</Text>
                </View>
                <View style={styles.buttons}>
                    <View style={styles.button}>
                        <TouchableHighlight onPress={() => {state.isRunning || this.reset()}}>
                            <Text style={[styles.resetButton, {backgroundColor: this.resetButtonColor}]}>Reset</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={styles.button}>
                        <TouchableHighlight onPress={() => state.isReady && (state.isRunning ? this.stop(): this.start())}>
                            <Text style={[styles.toggleButton, {backgroundColor: this.toggleButtonColor}]}>{this.toggleButtonText}</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                <Modal style={styles.modal} position="center" ref="copyright">
                    <Copyright />
                </Modal>
            </View>
        )
    }
}