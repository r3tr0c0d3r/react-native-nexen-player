import NexenPlayer from '../../components/NexenPlayer';
import { ControlHideMode, LayoutMode, EdgeInsets, PlaybackSpeed, PlaylistItem, NexenPlayerRef }  from '../../components/NexenPlayer';



declare module "react-native-nexen-player" {
    declare const NexenPlayer: React.ForwardRefExoticComponent<NexenPlayerProps & React.RefAttributes<NexenPlayerRef>>;
export default NexenPlayer;
   // export { ControlHideMode, LayoutMode, EdgeInsets, PlaybackSpeed, PlaylistItem, NexenPlayerRef }
}