const APDS9960_ADDRESS = 0x39
const APDS9960_ENABLE = 0x80
const APDS9960_ATIME = 0x81
const APDS9960_WTIME = 0x83
const APDS9960_AILTIL = 0x84
const APDS9960_AILTH = 0x85
const APDS9960_AIHTL = 0x86
const APDS9960_AIHTH = 0x87
const APDS9960_PILT = 0x89
const APDS9960_PIHT = 0x8B
const APDS9960_PERS = 0x8C
const APDS9960_CONFIG1 = 0x8D
const APDS9960_PPULSE = 0x8E
const APDS9960_CONTROL = 0x8F
const APDS9960_CONFIG2 = 0x90
const APDS9960_ID = 0x92
const APDS9960_STATUS = 0x93
const APDS9960_CDATAL = 0x94
const APDS9960_CDATAH = 0x95
const APDS9960_RDATAL = 0x96
const APDS9960_RDATAH = 0x97
const APDS9960_GDATAL = 0x98
const APDS9960_GDATAH = 0x99
const APDS9960_BDATAL = 0x9A
const APDS9960_BDATAH = 0x9B

let _wbuf = pins.createBuffer(2);

/**
   * set APDS9960's reg
   */
function setReg(reg: number, dat: number): void {
    _wbuf[0] = reg;
    _wbuf[1] = dat;
    pins.i2cWriteBuffer(APDS9960_ADDRESS, _wbuf);
}

/**
 * get a reg
 */
function getReg(reg: number): number {
    pins.i2cWriteNumber(APDS9960_ADDRESS, reg, NumberFormat.UInt8BE);
    return pins.i2cReadNumber(APDS9960_ADDRESS, NumberFormat.UInt8BE);
}


function getReg_int(reg: number): number {
    pins.i2cWriteNumber(APDS9960_ADDRESS, reg, NumberFormat.UInt8BE);
    return pins.i2cReadNumber(APDS9960_ADDRESS, NumberFormat.Int8LE);
}

/**
 * get two reg, UInt16LE format
 */
function get2Reg(reg: number): number {
    pins.i2cWriteNumber(APDS9960_ADDRESS, reg, NumberFormat.UInt8BE);
    return pins.i2cReadNumber(APDS9960_ADDRESS, NumberFormat.Int16BE);
}


function PowerOn() {
    let t = getReg(APDS9960_ENABLE)
    t |= 1
    setReg(APDS9960_ENABLE, t)
    basic.pause(3)
}


function PowerOff() {
    let t = getReg(APDS9960_ENABLE)
    t &= 0xFE
    setReg(APDS9960_ENABLE, t)
}


function ALSEnable(en: boolean = true) {
    let t = getReg(APDS9960_ENABLE)
    t &= 0x13
    if (en) t |= 19
    setReg(APDS9960_ENABLE, t)
}

function GAIN(en: boolean = true) {
    let t = getReg(APDS9960_CONTROL)
    t &= 0xFD
    if (en) t |= 2
    setReg(APDS9960_CONTROL, t)
}


function PERS_REG(en: boolean = true) {
    let t = getReg(APDS9960_PERS)
    t &= 0x02
    if (en) t |= 1
    setReg(APDS9960_PERS, t)
}

function init() {
    //ATIME(256 - 8)
    //setReg(APDS9960_ENABLE, 0)
    setReg(APDS9960_ATIME, 0xFF)
    basic.pause(10)
    setReg(APDS9960_WTIME, 0xFF)
    //setReg(APDS9960_PERS, 0x22)
    basic.pause(10)
    setReg(APDS9960_CONFIG1, 0X40)
    //setReg(APDS9930_PPULSE, 8)
    //setReg(APDS9960_CONTROL, 0x2C)
    basic.pause(10)
    PERS_REG(true)
    basic.pause(10)
    GAIN(true);
    basic.pause(10)
    ALSEnable(true)
    basic.pause(10)
    PowerOn();
    //WaitEnable(true)
}

//% color=#4c6ef5 weight=25 icon="\uf043" block="APDS9960"
namespace CIP_APDS9960 {
    let illuminance = 0
    init();
    /**
     * Returns a number describing the lux 
    */
    //% blockId="APDS9960_read_LUX"
    //% block="leer lux"
    export function leer_lux(): number {
        let G = getReg(APDS9960_ENABLE)
        let TL = get2Reg(APDS9960_AILTIL);
        let TH = get2Reg(APDS9960_AIHTH);
        let LH = get2Reg(APDS9960_AILTH);
        let HL = get2Reg(APDS9960_AIHTL);
        let l = getReg(APDS9960_STATUS);
        let c = get2Reg(APDS9960_CDATAL);
        basic.pause(10)
        if ((c >= TH + LH) || (c <= TL + HL)) {
            let r = get2Reg(APDS9960_RDATAL);
            let g = get2Reg(APDS9960_GDATAL);
            let b = get2Reg(APDS9960_BDATAL);
            illuminance = (-0.32466 * r) + (1.57837 * g) + (-0.73191 * b);
            illuminance = illuminance / 255
            if (illuminance < 0) illuminance = Math.abs(illuminance)
        }
        return G

    }
}