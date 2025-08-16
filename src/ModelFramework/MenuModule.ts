import { ComposeOpt } from "@zwa73/modular-mixer";
import { L2dMotion } from "../Live2D";
import { PDTap } from "../Predefined";
import { _L2dvexFramework, L2dMenuMotion } from "./ModelFramework";
import { UpdateModule } from "./UpdateModule";
import { assertLiteral } from "@zwa73/utils";






/** 混入设置 */
export const MenuModuleMixinOpt = {
    key:'__menuModule',
    fieldList:[
        'mainMenu'   ,
        'setMainMenu',
        'dctDecMtn'  ,
    ]
} as const;
assertLiteral<ComposeOpt<MenuModule>>(MenuModuleMixinOpt);
export class MenuModule {
    constructor(private _lf:
        Pick<_L2dvexFramework,'assignVar'|'addMotionsGroup'> & //防止循环引用
        Pick<UpdateModule,'addUpdateMotion'>
    ){}
    /**主菜单 需要使用 setMainMenu 初始化*/
    mainMenu:L2dMenuMotion={Choices:[]};
    /**双击计数器的自减器 需要使用 setMainMenu 初始化 */
    dctDecMtn?:L2dMotion;
    /**设置主菜单 使用此项将占用Tap动作作为双击菜单触发  
     * 需要在Update中添加计数器自减重置双击  
     * @param menu - 将设置为主菜单的动作
     */
    setMainMenu(menu:L2dMotion){
        //对计数器初始化
        this._lf.assignVar(_L2dvexFramework.V_DoubleClickCounter ,0 );
        //修正菜单
        const dbc: L2dMenuMotion = {
            ...menu,
            Name: "DoubliClick",
            TextDuration: _L2dvexFramework.MENU_DUR,
            Choices: [],
            VarFloats: [{
                Name: _L2dvexFramework.V_DoubleClickCounter,
                Type: 1,
                Code: "greater 0",
            },{
                Name: _L2dvexFramework.V_DoubleClickCounter,
                Type: 2,
                Code: "assign 0",
            }],
        };
        //设置Tap计数器
        this._lf.addMotionsGroup(PDTap, [dbc,{
                Name: "DoubliClickAdd",
                VarFloats: [{
                    Name: _L2dvexFramework.V_DoubleClickCounter,
                    Type: 2,
                    Code: "add 1",
                }],
            }]);
        //计数器自减
        this.dctDecMtn = {
            Weight: 999,
            VarFloats: [{
                Name: _L2dvexFramework.V_DoubleClickCounter,
                Type: 1,
                Code: "greater 0",
            },{
                Name: _L2dvexFramework.V_DoubleClickCounter,
                Type: 2,
                Code: "subtract 1",
            }],
        };
        this._lf.addUpdateMotion([this.dctDecMtn,{}]);
        return this.mainMenu = dbc;
    }
}