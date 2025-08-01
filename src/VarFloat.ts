
/**可用的写入命令 */
export type VarFloatSetCode = InitCode|AssignCode|SubCode|AddCode;
/**初始化为 x */
type InitCode   = `init ${VFObject}`;
/**赋值为 x */
type AssignCode = `assign ${VFObject}`;
/**降低 x */
type SubCode    = `subtract ${VFObject}`;
/**增加 x */
type AddCode    = `add ${VFObject}`;


/**可用的判断命令 */
export type VarFloatGetCode = EqualCode|NECode|GECode|LECode|GreCode|LowCode;
/**等于 x */
type EqualCode  = `equal ${VFObject}`;
/**不等于 x */
type NECode     = `not_equal ${VFObject}`;
/**大于等于 x */
type GECode     = `greater_equal ${VFObject}`;
/**小于等于 x */
type LECode     = `lower_equal ${VFObject}`;
/**大于 x */
type GreCode    = `greater ${VFObject}`;
/**小于 x */
type LowCode    = `lower ${VFObject}`;
/**小于
 * @param varObject - 目标值
 * @returns 小于操作码
 */
export function vcLower(varObject:VFObject){
    return `lower ${varObject}`;
}

/**构建随机数字符串
 * @param min - 最小
 * @param max - 最大
 * @returns 随机数字符串
 */
export function voRand(min:StringVar,max:StringVar):RandString{
    return `rand(${min},${max})`;
}
/**取某个变量值
 * @param name - 变量名
 * @returns 变量块
 */
export function voVar(name:string):NameVar{
    return `$${name}`;
}

/**变量块字符串 */
export type VFObject = RandString|StringVar;
/**随机值变量字符串 */
type RandString = `rand(${StringVar},${StringVar})`;
/**非函数变量字符串 */
type StringVar = NameVar|NumberVar;
/**引用变量字符串 */
type NameVar = `$${string}`;
/**常数字符串 */
type NumberVar = `${number}`|number;

