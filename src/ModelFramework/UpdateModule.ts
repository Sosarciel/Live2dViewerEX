import { ComposeOpt } from "@zwa73/modular-mixer";
import { L2dMotion } from "../Live2D";
import { MotionCommand, MotionGroup } from "../Motion";
import { PDTick } from "../Predefined";
import { VarFloatGetCode, VFObject } from "../VarFloat";
import { _L2dvexFramework } from "./ModelFramework";
import { assertLiteral } from "@zwa73/utils";



/** 混入设置 */
export const UpdateModuleMixinOpt = {
    key:'__updateModule',
    fieldList:[
        'addUpdateMotion'       ,
        'addTimerMotion'        ,
        'completeUpdateMotion'  ,
        'updateCount'           ,
        'getUpdateSeqMotuon'    ,
    ]
} as const;
assertLiteral<ComposeOpt<UpdateModule>>(UpdateModuleMixinOpt);
export class UpdateModule {
    constructor(private _lf:_L2dvexFramework){}
    /**更新动作数量 */
    updateCount = 0;
    /**获取updateseq动作组名 */
    static UpdateSeq = (x:number)=> `${_L2dvexFramework.M_UpdateSeq}${x}#${_L2dvexFramework.UpdateLayer}`;
    /**添加更新动作  
     * @param mtnGroup - 添加的动作组 若不设置则添加一个空数组
     */
    addUpdateMotion(mtnGroup:MotionGroup=[]):MotionGroup{
        this.updateCount++;
        for(const i in mtnGroup){
            const obj = mtnGroup[i];
            obj.Name = `${_L2dvexFramework.M_UpdateSeq}${this.updateCount}_${i}`;
            obj.NextMtn = UpdateModule.UpdateSeq(this.updateCount+1);
        }
        this._lf.addMotionsGroup(UpdateModule.UpdateSeq(this.updateCount),mtnGroup);
        return mtnGroup;
    }
    /**添加自减计时器
     * @param postCommand - 为0时将会触发的PostCommand
     * @param valName     - 计数器变量名
     * @param resetNum    - 计数器触发后将会重设为此
     * @param conditions  - 计数器触发所需要的额外变量条件组 [ 变量 , 判断条件 ]
     */
    addTimerMotion(postCommand:MotionCommand,valName:string,resetNum?:VFObject,...conditions:[string,VarFloatGetCode][]){
        const mtn = this.addUpdateMotion([{
                Weight: 999,
                PostCommand: postCommand,
                VarFloats: [{
                    Name: valName,
                    Type: 1,
                    Code: "lower_equal 0",
                }],
            },
            {
                Weight: 999,
                VarFloats: [{
                    Name: valName,
                    Type: 1,
                    Code: "greater 0",
                },
                {
                    Name: valName,
                    Type: 2,
                    Code: "subtract 0.5",
                }],
            },{}
        ]);
        if(resetNum!=null){
            mtn[0].VarFloats!.push({
                "Name": valName,
                "Type": 2,
                "Code": `assign ${resetNum}`
            })
        }
        for(const cond of conditions){
            const tiggerVal  = cond[0];
            const tiggerText = cond[1];
            mtn[0].VarFloats!.push({
                Name: tiggerVal,
                Type: 1,
                Code: tiggerText
            })
        }
        type L2dVFMtn = L2dMotion & Required<Pick<L2dMotion,'VarFloats'>>;
        return mtn as {
            /**触发动作 */
            0:L2dVFMtn;
            /**自减动作 */
            1:L2dVFMtn;
            /**缺省防阻塞的空动作 */
            2:L2dMotion;
        } & [L2dVFMtn,L2dVFMtn,L2dMotion];
    }
    /**根据下标获取某一个更新序列动作组  
     * @param index - 目标下标
     */
    getUpdateSeqMotuon(index:number){
        return this._lf.motions[UpdateModule.UpdateSeq(index)];
    }
    /**完成Update动作 计算填补间隔 生成修复器  
     * 将会占用Tap动作作为更新修复器  
     */
    completeUpdateMotion(){
        //update间隔
        const base = 500;
        //软件刷新率
        const rate = 30;

        if(this.updateCount==0) return;
        //30帧模式下每个动作至少需要(1/30)秒, 确保update稳定0.5s需要补正
        //这里使用200
        this._lf.addMotionsGroup(_L2dvexFramework.M_Update,[{
            Name: _L2dvexFramework.M_UpdateSeq,
            //MotionDuration: 200,
            MotionDuration: Math.round(base - (this.updateCount+1)*1000/rate),
            NextMtn: UpdateModule.UpdateSeq(1),
            VarFloats:[{
                Name: _L2dvexFramework.V_StopTimer,
                Type: 1,
                Code: "not_equal 1"
            }]
        }]);

        //修复计时器动作
        this._lf.addMotionsGroup(_L2dvexFramework.M_RepairTimer, [{
            Name: "RepairTimer",
            Weight: 999,
            NextMtn: _L2dvexFramework.M_Update,
        }]);
        //自动修复计数器 Tick无法设置层级
        this._lf.addMotionsGroup(PDTick,[{
            "Name": "AutoRepairTimer",
            "Command": `start_mtn ${_L2dvexFramework.M_RepairTimer}`
        }]);
    }
}