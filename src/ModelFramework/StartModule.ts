import { ComposeOpt } from "@zwa73/modular-mixer";
import { MotionCommand, MotionGroup } from "../Motion";
import { _L2dvexFramework, L2dvexFramework } from "./ModelFramework";
import { assertLiteral } from "@zwa73/utils";




/** 混入设置 */
export const StartModuleMixinOpt = {
    key:'__startModule',
    fieldList:[
        'addStartPrevMotion'        ,
        'completeStartPrevMotion'   ,
        'addStartAfterMotion'       ,
        'setStartEndMotion'         ,
        'completeStartAfterMotion'  ,
    ]
} as const;
assertLiteral<ComposeOpt<StartModule>>(StartModuleMixinOpt);
export class StartModule {
    constructor(private _lf:_L2dvexFramework){}
    //#region StartPrev 动作
    /**动作计数器 */
    private startPrevCounter = 0;
    /**获取startseq动作组名 */
    static StartPrevSeq = (x:number)=> x==1 ? _L2dvexFramework.M_StartPrevSeq : `${_L2dvexFramework.M_StartPrevSeq}${x}`;
    /**添加一个StartPrev动作  
     * @param mtnGroup - 添加的动作组 若不设置则添加一个空数组
     */
    addStartPrevMotion(mtnGroup:MotionGroup=[]){
        this.startPrevCounter++;
        for(const i in mtnGroup){
            const obj = mtnGroup[i];
            obj.Name    = `${StartModule.StartPrevSeq(this.startPrevCounter)}_${i}`;
            obj.Command = obj.Command
                ? `${obj.Command};` as MotionCommand
                : '' as MotionCommand;
            obj.Command += `start_mtn ${StartModule.StartPrevSeq(this.startPrevCounter+1)}`;
        }
        return this._lf.addMotionsGroup(StartModule.StartPrevSeq(this.startPrevCounter),mtnGroup);
    }
    /**完成Start动作, 添加尾部链接 */
    completeStartPrevMotion(){
        if(this.startPrevCounter==0) return;
        const lastMtnGroup = this._lf.motions[StartModule.StartPrevSeq(this.startPrevCounter)]!;
        //尾部链接
        const hasFrameworkStart = Object.keys(this._lf.motions)
            .some(groupName => groupName === _L2dvexFramework.M_FrameworktStart);
        //尾部链接
        const link = (mg:MotionGroup)=>{
            if(hasFrameworkStart) mg.forEach(obj => obj.Command =
                `start_mtn ${_L2dvexFramework.M_FrameworktStart}`);
            else mg.forEach(obj => obj.Command =
                `start_mtn ${_L2dvexFramework.M_StartAfter}`);
        }
        const flag = `start_mtn ${StartModule.StartPrevSeq(this.startPrevCounter+1)}`;
        const lastcmd = lastMtnGroup[0].Command??'';
        if(lastcmd.replace(flag,'').length<=0) return link(lastMtnGroup);

        const addLastArr = this.addStartPrevMotion([{}]);
        link(addLastArr);
    }
    //#endregion
    //#region StartAfter 动作
    /**动作计数器 */
    private startAfterCount = 0;
    /**Start结束后尾随的动作 */
    private startEndLinkMtnName:string|undefined;
    /**获取startseq动作组名 */
    static StartAfterSeq = (x:number)=> x==1 ? _L2dvexFramework.M_StartAfterSeq : `${_L2dvexFramework.M_StartAfterSeq}${x}`;
    /**添加一个StartAfter动作  
     * @param mtnGroup - 添加的动作组 若不设置则添加一个空数组
     */
    addStartAfterMotion(mtnGroup:MotionGroup=[]):MotionGroup{
        this.startAfterCount++;
        for(const i in mtnGroup){
            const obj = mtnGroup[i];
            obj.Name    = `${StartModule.StartAfterSeq(this.startAfterCount)}_${i}`;
            obj.Command = obj.Command
                ? `${obj.Command};` as MotionCommand
                : '' as MotionCommand;
            obj.Command += `start_mtn ${StartModule.StartAfterSeq(this.startAfterCount+1)}`;
        }
        return this._lf.addMotionsGroup(StartModule.StartAfterSeq(this.startAfterCount),mtnGroup);
    }
    /**设置StartEnd链接的动作 将会在完成StartOver变量设置后 触发
     * @param mtnName - 动作层级
     */
    setStartEndMotion(mtnName:string){
        this.startEndLinkMtnName = mtnName;
    }
    /**完成Start动作, 添加尾部链接 */
    completeStartAfterMotion(){
        if(this.startAfterCount==0) return;
        const lastMtnGroup = this._lf.motions[StartModule.StartAfterSeq(this.startAfterCount)]!;
        //结束mtn
        this._lf.addMotions(_L2dvexFramework.M_StartEnd,{
            Name:_L2dvexFramework.M_StartEnd,
            VarFloats: [{
                Name: L2dvexFramework.V_StartOver,
                Type: 2,
                Code: "assign 1",
            }],
            Command: this.startEndLinkMtnName ? `start_mtn ${this.startEndLinkMtnName}` : undefined
        })
        //尾部链接
        const link = (mg:MotionGroup)=>
            mg.forEach(obj => obj.Command = `start_mtn ${_L2dvexFramework.M_StartEnd}`);
        const flag = `start_mtn ${StartModule.StartAfterSeq(this.startAfterCount+1)}`;
        const lastcmd = lastMtnGroup[0].Command??'';
        if(lastcmd.replace(flag,'').length<=0) return link(lastMtnGroup);
        const addLastArr = this.addStartAfterMotion([{}]);
        link(addLastArr);
    }
    //#endregion
}