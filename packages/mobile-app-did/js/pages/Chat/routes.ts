import ChatHomePage from './ChatHomePage';
import ChatDetailsPage from './ChatDetailsPage';
import ChatGroupDetailsPage from './ChatGroupDetailsPage';
import CreateGroupPage from './CreateGroupPage';
import ChatCameraPage from './ChatCameraPage';
import SearchPeoplePage from './SearchPeoplePage';
import NewChatHomePage from './NewChatHomePage';
import FindMorePeoplePage from './FindMorePeoplePage';
import GroupInfoPage from './GroupInfoPage';
import EditGroupPage from './EditGroupPage';
import TransferOwnershipPage from './TransferOwnershipPage';
import GroupMembersPage from './GroupMembersPage';
import AddMembersPage from './AddMembersPage';
import RemoveMembersPage from './RemoveMembersPage';
import ChatQrCodePage from './ChatQrCodePage';
import ChatGroupQrCodePage from './ChatGroupQrCodePage';
import SelectGroupMembersToTransferPage from './SelectGroupMembersToTransferPage';

const stackNav = [
  { name: 'ChatHomePage', component: ChatHomePage },
  { name: 'ChatCameraPage', component: ChatCameraPage },
  { name: 'ChatDetailsPage', component: ChatDetailsPage },
  { name: 'ChatGroupDetailsPage', component: ChatGroupDetailsPage },
  { name: 'CreateGroupPage', component: CreateGroupPage },
  { name: 'SearchPeoplePage', component: SearchPeoplePage },
  { name: 'NewChatHomePage', component: NewChatHomePage },
  { name: 'FindMorePeoplePage', component: FindMorePeoplePage },
  { name: 'GroupInfoPage', component: GroupInfoPage },
  { name: 'EditGroupPage', component: EditGroupPage },
  { name: 'TransferOwnershipPage', component: TransferOwnershipPage },
  { name: 'GroupMembersPage', component: GroupMembersPage },
  { name: 'AddMembersPage', component: AddMembersPage },
  { name: 'RemoveMembersPage', component: RemoveMembersPage },
  { name: 'ChatQrCodePage', component: ChatQrCodePage },
  { name: 'ChatGroupQrCodePage', component: ChatGroupQrCodePage },
  { name: 'SelectGroupMembersToTransferPage', component: SelectGroupMembersToTransferPage },
] as const;

export default stackNav;
