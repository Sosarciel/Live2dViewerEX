import { L2dMotion } from "./Live2D";
import { MotionCommand, MotionTable } from "./Motion";
import { SpineMotion } from "./Spine";
import path from 'pathe';

export class L2dvexUtil{

/**将字符串从小蛇命名法转换为小驼峰命名法。
 * @param str - 需要转换的字符串。
 * @returns 转换后的字符串。
 */
static toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
}

/**将字符串从小蛇命名法或小驼峰命名法转换为大驼峰命名法。
 * @param str - 需要转换的字符串。
 * @returns 转换后的字符串。
 */
static toPascalCase(str: string): string {
    const camelCase = L2dvexUtil.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**将字符串从大驼峰命名法或小驼峰命名法转换为小蛇命名法。
 * @param str - 需要转换的字符串。
 * @returns 转换后的字符串。
 */
static toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

/**将对象或数组的键递归地转换为另一种命名法。
 * @param obj - 需要转换的对象或数组。
 * @param func - 用于转换键的函数。
 * @returns 转换后的对象或数组。
 */
static transformKeys(obj: any, func: (key: string) => string): any {
    if (Array.isArray(obj)) {
        return obj.map(item => L2dvexUtil.transformKeys(item, func));
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((result, key) => {
            result[func(key)] = L2dvexUtil.transformKeys(obj[key], func);
            return result;
        }, {} as any);
    }
    return obj;
}

/**重命名单层对象键。
 * @param obj - 需要重命名的对象。
 * @param func - 用于重命名键的函数。
 */
static renameKey(obj: Record<string, any>, func: (key: string) => string) {
    const keys = Object.keys(obj);
    const nobj = keys.reduce((result, key) => {
        result[func(key)] = obj[key];
        delete obj[key];
        return result;
    }, {} as Record<string, any>);
    Object.assign(obj, nobj);
}

/**将SpineMotion对象转换为L2dMotion对象。
 * @param mtn - 需要转换的SpineMotion对象。
 * @returns 转换后的L2dMotion对象。
 */
static spineMtn2L2d(mtn: SpineMotion): L2dMotion {
    return L2dvexUtil.transformKeys(mtn, L2dvexUtil.toPascalCase);
}
/**将SpineMotion对象转换为L2dMotion对象。
 * @param table - 需要转换的 MotionTable<L2dMotion> 对象。
 * @returns 转换后的 MotionTable<L2dMotion> 对象。
 */
static spineMtnTable2L2d(table: MotionTable<SpineMotion>): MotionTable<L2dMotion> {
    return Object.keys(table).reduce((acc,tk)=>{
        acc[tk] = table[tk].map((v)=>L2dvexUtil.spineMtn2L2d(v));
        return acc;
    }, {} as MotionTable<L2dMotion>)
}

/**将L2dMotion对象转换为SpineMotion对象。
 * @param mtn - 需要转换的L2dMotion对象。
 * @returns 转换后的SpineMotion对象。
 */
static l2dMtn2Spine(mtn: L2dMotion): SpineMotion {
    return L2dvexUtil.transformKeys(mtn, L2dvexUtil.toSnakeCase);
}
/**将SpineMotion对象转换为L2dMotion对象。
 * @param table - 需要转换的 MotionTable<L2dMotion> 对象。
 * @returns 转换后的 MotionTable<L2dMotion> 对象。
 */
static l2dMtnTable2spine(table: MotionTable<L2dMotion>): MotionTable<SpineMotion> {
    const fmtn = (t:string)=>t
        .replace(/^Idle/     ,'idle')
        .replace(/^Tap(.+)/  ,'tap_$1')
        .replace(/^Tap$/     ,'tap')
        .replace(/^Tick$/    ,'tick')
        .replace(/^Start$/   ,'start');
    const nkmtn = Object.keys(table).reduce((acc,tk)=>{
        const nk = fmtn(tk);
        acc[nk] = table[tk].map((v)=>L2dvexUtil.l2dMtn2Spine(v));
        return acc;
    }, {} as MotionTable<SpineMotion>);

    const rpfn = (match:string,g1:string)=>`start_mtn ${fmtn(g1)}`;
    Object.values(nkmtn).forEach((mg)=>{
        mg.forEach((mn)=>{
            if(mn.command?.startsWith('start_mtn'))
                mn.command = mn.command.split(';')
                    .map((c)=>c.replace(/start_mtn (.+)/,rpfn))
                    .join(';') as MotionCommand;
            if(mn.post_command?.startsWith('start_mtn'))
                mn.post_command = mn.post_command.split(';')
                    .map((c)=>c.replace(/start_mtn (.+)/,rpfn))
                    .join(';') as MotionCommand;
            mn.next_mtn = mn.next_mtn ? fmtn(mn.next_mtn) : undefined;
            mn.pre_mtn = mn.pre_mtn ? fmtn(mn.pre_mtn) : undefined;
        })
    });
    return nkmtn;
}

/**修正文件引用位置  
 * @param table    - 动作表
 * @param basePath - 引用基础位置
 * @param siSpine  - 是spine
 */
static fixFileReslove(table: MotionTable<L2dMotion>,basePath:string,isSpine:boolean){
    //修正文件引用位置
    const rpfn = (prefix:string)=>(match:string,g1:string)=>`${prefix}${path.relative(basePath,g1)}`;
    const rt0 = "replace_tex 0 ";
    const rprtfn = rpfn(rt0);
    Object.values(table).forEach((mg)=>{
        mg.forEach((mn)=>{
            if(mn.Command?.startsWith(rt0))
                mn.Command = mn.Command.split(';')
                    .map(c=>c.replace(/replace_tex 0 (.+)/,rprtfn))
                    .join(';') as MotionCommand;
            if(mn.PostCommand?.startsWith(rt0))
                mn.PostCommand = mn.PostCommand.split(';')
                    .map(c=>c.replace(/replace_tex 0 (.+)/,rprtfn))
                    .join(';') as MotionCommand;

            if(mn.Sound) mn.Sound = path.relative(basePath,mn.Sound);
            if(isSpine) return;//spine的动作均为内置
            if(mn.File) mn.File = path.relative(basePath,mn.File);
        })
    });
}

/**获取动作层 */
static getLayer(mtnname:string){
    const { layer } = L2dvexUtil.parseMtnName(mtnname);
    return layer ?? 0;
}

/**设置动作层 */
static setLayer(mtnname:string,layer:number){
    if(layer<0) throw new Error(`layer 错误 ${layer}`);
    const { name, extra } = L2dvexUtil.parseMtnName(mtnname);
    if(layer==0) return name + (extra ? `:${extra}` : '');
    return `${name}#${layer}${extra ? `:${extra}` : ''}`;
}

/**清除动作层 */
static cleanLayer(mtnname:string){
    const { name, extra } = L2dvexUtil.parseMtnName(mtnname);
    return name + (extra ? `:${extra}` : '');
}
/**解析动作名 */
static parseMtnName(mtnName:string){
    // 使用正则表达式匹配动作名称
    const match = mtnName.match(/^(.*?)(#\d+)?(:.+)?$/);
    if (!match) throw new Error(`无法解析动作名称: ${mtnName}`);

    // 提取匹配结果
    const [, name, layer, extra] = match;

    // 返回解析结果
    return {
        /**动作组名 */
        name: name ?? '',
        /**层级 */
        layer: layer ? parseInt(layer.slice(1)) : undefined,
        /**指定的子动作名 */
        extra: extra ? extra.slice(1) : undefined
    };
}
/**追加指令 */
static pushCmd(base:MotionCommand|undefined,add:MotionCommand):MotionCommand{
    return base ? `${base};${add}` as MotionCommand : add;
}
}
