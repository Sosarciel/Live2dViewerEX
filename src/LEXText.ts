

/**当前时间 */
export const TIME_NOW = "{$timenow}";
/**换行 */
export const BR = "{$br}";
/**好感度 */
export const INTIMACY = "{$intimacy}";
/**显示整数变量
 * @param {string} varName - 变量名
 * @returns 变量字符串
 */
export function sInt(varName:string):string{
    return `{$vi_${varName}}`
}
/**显示浮点变量
 * @param {string} varName - 变量名
 * @returns 变量字符串
 */
export function sFloat(varName:string):string{
    return `{$vf_${varName}}`
}

/**格式化文本 */
export function formatText(text:string){
    return text.replace(/\\r\\n/g, BR)
        .replace(/\\n/g, BR).trim();
}
