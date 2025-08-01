import { L2dChoice, L2dMotion, L2dvexLive2DModel } from './Live2D';
import { L2dvexSpineModel, SpineMotion } from './Spine';
import { VFObject } from './VarFloat';


/**动作指令 */
export type MotionCommand = StartMtn|StopSound|AOSet|RTex|MTrack|ETrack|CCos;
/**启动动作 */
type StartMtn = `start_mtn ${string}`;
/**停止某个通道的声音 */
type StopSound = `stop_sound ${0|1|2}`;
/**设置透明度 0-1 0为不透明*/
type AOSet = `artmesh_opacities set ${string} ${VFObject}`;
/**替换 number号材质为 string路径 */
type RTex =  `replace_tex ${number} ${string}`;
/**打开或关闭鼠标追踪 */
type MTrack = "mouse_tracking enable"|"mouse_tracking disable";
type ETrack = "eye_blink enable"|"eye_blink disable";
/**切换皮肤 */
type CCos = `change_cos ${string}`;


export type MotionGroup<T extends L2dMotion|SpineMotion = L2dMotion> = T[];
export type MotionTable<T extends L2dMotion|SpineMotion = L2dMotion> = {
    [key:string]:MotionGroup<T>
};


export type AnyL2dvexModel = L2dvexLive2DModel|L2dvexSpineModel;





