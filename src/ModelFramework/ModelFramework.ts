import { AnyL2dvexModel, MotionGroup, MotionTable } from "../Motion";
import { L2dMotion, L2dVarFloatObject, L2dvexLive2DModel } from "../Live2D";
import { L2dvexSpineModel } from "../Spine";
import {IJData, None, UtilFunc} from '@zwa73/utils';
import { L2dvexUtil } from "../UtilFunc";
import { MAX_WEIGHT, PDIdle, PDStart } from "../Predefined";
import { VFObject } from "../VarFloat";
import { UpdateModule, UpdateModuleMixinOpt } from "./UpdateModule";
import { StartModule, StartModuleMixinOpt } from "./StartModule";
import { MenuModule, MenuModuleMixinOpt } from "./MenuModule";
import { composeClass } from "@zwa73/modular-mixer";

/**l2d菜单动作 */
export type L2dMenuMotion = Omit<L2dMotion,'Choices'> & Required<Pick<L2dMotion,'Choices'>>;

/**索引数据 */
export type IndexMenuData = {
    /**索引数字 */
    num:number          ;
    /**索引名 如 A-C  */
    name:string         ;
    /**索引指向的菜单 */
    menu:L2dMenuMotion  ;
};

//生成显示变量文本
function vtext(desctext:string,varName:string){
    return `${desctext}: {$vi_${varName}}`;
}

/**用于辅助创建L2dVex模型的类 未混入 */
export class _L2dvexFramework<T extends AnyL2dvexModel = AnyL2dvexModel> implements IJData{
    //#region 常量
    /**菜单显示时间 */
    static readonly MENU_DUR = 5000;
    //#endregion
    //#region 预留层级
    static readonly ControlLayer = 99;
    static readonly UpdateLayer  = 98;
    //#endregion
    //#region 变量定义
    /** 1 表示已经完成StartEnd */
    static readonly V_StartOver = "StartOver";
    /** 1 表示停止Update */
    static readonly V_StopTimer = "StopTimer";
    /** 双击菜单计时器 */
    static readonly V_DoubleClickCounter = "DoubleClickTimer";
    //#endregion
    //#region 动作名定义
    // Start -> Init -> InitNext -> FStartPrev -> FStartPrevSeq[x] ->
    // FrameworkStart -> FStartAfter -> FStartAfter[x] -> StartEnd -> StartEndLink
    /**初始化动作 用于重设V_StartOver */
    static readonly M_Init  = 'Init';
    /**第二段初始化动作 用于重载变量 */
    static readonly M_InitNext  = 'InitNext';

    /**在框架提供的Start之前执行的动作 用于处理指令设置 主动作名 */
    static readonly M_StartPrev      = 'FStartPrev';
    /**在框架提供的Start之前执行的动作 用于处理指令设置 序列名 */
    static readonly M_StartPrevSeq   = 'FStartPrev';

    /**框架提供的可选Start动作 */
    static readonly M_FrameworktStart  = 'FrameworktStart';

    /**在框架提供的Start之后执行的动作 用于修复计时器 主动作名 */
    static readonly M_StartAfter    = 'FStartAfter';
    /**在框架提供的Start之后执行的动作 用于修复计时器 序列名 */
    static readonly M_StartAfterSeq  = 'FStartAfter';

    /**每隔半秒运行一次的动作 序列名 */
    static readonly M_UpdateSeq = "Update";
    /**每隔半秒运行一次的动作 主动作名 */
    static readonly M_Update  = `${PDIdle}#${this.UpdateLayer}`;

    /**在框架Start完全结束后的动作 用于设置V_StartOver变量 */
    static readonly M_StartEnd  = 'FStartEnd';
    /**用于启动计时器的动作 */
    static readonly M_RepairTimer  = `RepairTimer#${this.ControlLayer}`;
    /**用于停止计时器的动作 */
    static readonly M_StopTimer    = `StopTimer#${this.ControlLayer}`;
    //#endregion
    /**在Init阶段预留的统一初始化位置 */
    protected initVarList:L2dVarFloatObject[];
    /**统一使用L2d模式的动作 */
    motions:MotionTable<L2dMotion>;
    private _isSpine:boolean|None=None;
    /**
     * @param _model - 基础的model json
     */
    constructor(protected _model:T){
        this.motions = this.withType({
            l2d:(mod)=>mod._model.FileReferences.Motions ??= {},
            spe:(mod)=>L2dvexUtil.spineMtnTable2L2d(mod._model.motions ?? {}),
        })

        //Start动作
        //建立初始化动作
        this.addMotions(PDStart,{
            Name            : L2dvexFramework.M_Init,
            Weight          : MAX_WEIGHT,
            //L2dvex软件在加载大量数据时会出现脚本时序混乱
            //添加1500ms延迟可缓解问题
            MotionDuration  : this.isSpine() ? 2500 : 1500,
            NextMtn         : L2dvexFramework.M_InitNext,
            VarFloats       :[{
                "Name": L2dvexFramework.V_StartOver,
                "Type": 2,
                "Code": "assign 0"
            }],
        });

        //第二段初始化
        this.initVarList = [];
        this.addMotions(L2dvexFramework.M_InitNext,{
            Name: L2dvexFramework.M_InitNext,
            Weight: MAX_WEIGHT,
            Command: `start_mtn ${StartModule.StartPrevSeq(1)}`, //避免被Idle0打断重载 start链需用Command链接
            VarFloats: this.initVarList
        });
        return compose(this);
    }
    private isCompleted = false;
    /**设置为完成, 开始动作链接 */
    setCompleted(){
        if(this.isCompleted) return;
        f(this).completeStartPrevMotion();
        f(this).completeStartAfterMotion();
        f(this).completeUpdateMotion();
        this.isCompleted = true;
    }
    toJSON():T {
        this.setCompleted();
        this.withType({
            spe:(mod)=>mod._model.motions = L2dvexUtil.l2dMtnTable2spine(this.motions),
        });
        return this._model;
    }
    //#region 判断函数
    /**根据模型类型处理并返回相应的结果。
     * @template TL - L2d模型处理函数的返回类型。
     * @template TS - Spine模型处理函数的返回类型。
     * @param match - 包含处理函数的对象，`l2d`用于处理L2d模型，`spine`用于处理Spine模型。
     * @returns 如果模型是L2d模型，则返回`l2d`处理函数的结果；如果模型是Spine模型，则返回`spine`处理函数的结果。
     */
    withType<TL=undefined,TS=undefined>(match:{
        l2d?: (model: L2dvexFramework<L2dvexLive2DModel>) => TL,
        spe?: (model: L2dvexFramework<L2dvexSpineModel> ) => TS
    }):T extends L2dvexLive2DModel ? TL : TS{
        match.l2d = match.l2d ?? (()=>undefined) as any;
        match.spe = match.spe ?? (()=>undefined) as any;
        return (this.isSpine()
            ? match.spe!(this as L2dvexFramework<L2dvexSpineModel>)
            : match.l2d!(f(this) as L2dvexFramework<L2dvexLive2DModel>)) as any;
    }
    /**是否为spine */
    isSpine():this is L2dvexFramework<L2dvexSpineModel>{
        if(this._isSpine == None)
            return this._isSpine = !('FileReferences' in this._model);
        return this._isSpine;
    }
    //#endregion
    //#region 动作工具函数
    /**添加一个动作  
     * @param groupName - 添加的动作组名
     * @param motion    - 动作数据
     * @param layer     - 动作层级 默认不对groupName修改
     */
    addMotions(groupName:string,motion:L2dMotion,layer?:number){
        if(layer!=undefined) groupName = L2dvexUtil.setLayer(groupName,layer);
        this.motions[groupName] = this.motions[groupName]??[];
        this.motions[groupName].push(motion);
        return motion;
    }
    /**添加一个动作组, 若重名则会覆盖  
     * @param groupName - 添加的动作组名
     * @param groupList - 动作组数据
     * @param layer     - 动作层级 默认不对groupName修改
     */
    addMotionsGroup(groupName:string,groupList:MotionGroup=[],layer?:number){
        if(layer!=undefined) groupName = L2dvexUtil.setLayer(groupName,layer);
        this.motions[groupName]=groupList;
        return groupList;
    }
    /**创建一个菜单选项, 使其指向某个动作组
     * @param menu      - 菜单
     * @param groupName - 动作组名
     * @param text      - 选项的显示文本
     * @param mtnList   - 动作组内容 若设置则会以此创建动作组
     * @param layer     - 动作层级 默认不对groupName修改
     * @returns 返回创建或指向的动作组
     */
    addChoices(menu:L2dMotion,groupName:string,text:string,mtnList?:MotionGroup,layer?:number){
        if(layer!=undefined) groupName = L2dvexUtil.setLayer(groupName,layer);
        if(mtnList!=null) this.motions[groupName]=mtnList;
        else mtnList=this.motions[groupName];
        menu.Choices ??= [];
        menu.Choices.push({ "Text": text, "NextMtn": groupName });
        return mtnList;
    }
    /**创建一个子菜单
     * @param parentMenu - 父菜单动作
     * @param groupName  - 动作组名
     * @param text       - 新菜单的显示文本
     * @param layer      - 动作层级 默认不对groupName修改
     * @returns 返回新创建的菜单的动作
     */
    createSubmenu(parentMenu:L2dMotion,groupName:string,text:string,layer?:number){
        if(layer!=undefined) groupName = L2dvexUtil.setLayer(groupName,layer);
        const nmenu = {
            Name: L2dvexUtil.cleanLayer(groupName),
            Text: text,
            TextDuration: L2dvexFramework.MENU_DUR,
            Choices: []
        }
        this.motions[groupName] = [nmenu];
        this.addChoices(parentMenu,groupName,text);
        return nmenu as L2dMenuMotion;
    }
    /**创建一个开关
     * @param parentMenu  - 父菜单
     * @param varName     - 开关变量名
     * @param init        - 变量初始化值
     * @param groupName   - 开关动作组名 未分配则使用变量名
     * @param isAssign    - 每次启动重新分配, 而非初始化
     * @param displayText - 开关显示文本 未分配则使用动作组名
     * @param layer       - 动作层级 默认不对groupName修改
     * @returns 开关动作组
     */
    createSwitch(args:{
        parentMenu:L2dMotion,
        varName:string,
        init:VFObject,

        groupName?:string;
        isAssign?:boolean;
        displayText?:string;
        layer?:number;
    }){
        const {isAssign,layer,init,parentMenu,varName} = args;
        let {displayText,groupName} = args;
        groupName   ??= varName;
        displayText ??= groupName;

        if(layer!=undefined) groupName = L2dvexUtil.setLayer(groupName,layer);

        if(!isAssign) this.initVar(varName,init);
        else this.assignVar(varName,init);
        const arr: MotionGroup = [{
                Name: "开",
                Text: `${displayText}: 开`,
                VarFloats: [{
                    Name: varName,
                    Type: 1,
                    Code: "not_equal 1",
                },
                {
                    Name: varName,
                    Type: 2,
                    Code: "assign 1",
                },],
            },{
                Name: "关",
                Text: `${displayText}: 关`,
                VarFloats: [{
                    Name: varName,
                    Type: 1,
                    Code: "not_equal 0",
                },
                {
                    Name: varName,
                    Type: 2,
                    Code: "assign 0",
                }],
            },
        ];
        this.addMotionsGroup(groupName,arr);
        type SwitchList = {
            /**打开动作 */
            [0]:L2dMotion&Required<Pick<L2dMotion,'VarFloats'>>;
            /**关闭动作 */
            [1]:L2dMotion&Required<Pick<L2dMotion,'VarFloats'>>;
        }
        return this.addChoices(parentMenu,groupName,vtext(displayText,varName),undefined,layer) as any as SwitchList;
    }
    /**生成索引菜单
     * @param parentMenu  - 父菜单
     * @param groupPrefix - 菜单前缀 创建为 菜单前缀-索引
     * @param indexList   - 索引分段标记 如 [A,D,Z]
     * @param layer       - 动作层级 默认无层级 即 0
     */
    genIndexMenu(parentMenu:L2dMenuMotion,name:string,indexList:string[],layer?:number){
        const menuList:IndexMenuData[] = [];
        let preObj:IndexMenuData|null = null;
        //分段数据
        for(const ascii of indexList){
            const num = ascii.charCodeAt(0);
            const obj:IndexMenuData = {
                num,name:ascii,menu:{} as any
            };
            menuList.push(obj);
            if(preObj!=null) preObj.name += `-${String.fromCharCode(num-1)}`;
            preObj = obj;
        }
        if(preObj==null) throw  new Error("genIndexMenu 至少需要一个索引");
        preObj.name += "-Z";

        //分段菜单
        for(const data of menuList){
            let groupName = `${name}-${data.name}`;
            const menu = this.createSubmenu(parentMenu,groupName,data.name,layer);
            data.menu = menu;
        }

        return menuList;
    }
    /**根据索引菜单数据, 选出分配的索引菜单
     * @param indexMenus 索引菜单数组
     * @param indexName  索引目标名
     */
    selIndexMenu(indexMenus:IndexMenuData[],indexName:string){
        const num = indexName.charCodeAt(0);
        let menuNum = "0";
        for(const i in indexMenus){
            const data = indexMenus[i];
            if(num<data.num) break;
            menuNum = i;
        }
        return indexMenus[parseInt(menuNum)].menu;
    }
    /**在初始化阶段, 为内部变量初始化 name ??= text */
    initVar(name:string,text:VFObject){
        this.initVarList.push({
            Name: name,
            Type: 2,
            Code: `init ${text}`
        })
    }
    /**在初始化阶段, 给一个内部变量赋值 name = text */
    assignVar(name:string,text:VFObject){
        this.initVarList.push({
            Name: name,
            Type: 2,
            Code: `assign ${text}`
        })
    }
    //#endregion
}

/**组合框架 */
function compose<T extends AnyL2dvexModel = AnyL2dvexModel>(base:_L2dvexFramework<T>){
    const mix1 = composeClass(base,
        {mixin:new UpdateModule(base),...UpdateModuleMixinOpt},
        {mixin:new StartModule(base) ,...StartModuleMixinOpt},
    )

    const menu = new MenuModule(mix1);
    const mix2 = composeClass(mix1,
        {mixin:menu,...MenuModuleMixinOpt}
    );
    return mix2;
}
/**修正this */
function f<T extends AnyL2dvexModel = AnyL2dvexModel>(t:_L2dvexFramework<T>){
    return t as L2dvexFramework<T>
}

/**用于辅助创建L2dVex模型的类 */
export const L2dvexFramework = _L2dvexFramework as
    Omit<typeof _L2dvexFramework,'new'>&{
        new<T extends AnyL2dvexModel = AnyL2dvexModel>
            (_model:T):L2dvexFramework<T>
    };

/**用于辅助创建L2dVex模型的类 */
export type L2dvexFramework<T extends AnyL2dvexModel = AnyL2dvexModel> =
    ReturnType<typeof compose<T>>;