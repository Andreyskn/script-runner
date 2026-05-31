import { cls } from './RootPathSetting.styles';

export type RootPathSettingProps = {};

export const RootPathSetting: React.FC<RootPathSettingProps> = (props) => {
	const {} = props;

	return <div className={cls.setting.block()}>RootPathSetting</div>;
};
