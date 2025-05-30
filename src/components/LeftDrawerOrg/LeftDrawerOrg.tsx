/**
 * Component representing the left drawer for organization-related navigation and actions.
 *
 * @component
 * @param {InterfaceLeftDrawerProps} props - The props for the component.
 * @param {Array} props.targets - List of navigation targets with names and URLs.
 * @param {string} props.orgId - The ID of the organization to fetch data for.
 * @param {boolean | null} props.hideDrawer - State indicating whether the drawer is hidden.
 * @param {React.Dispatch<React.SetStateAction<boolean | null>>} props.setHideDrawer - Function to toggle the drawer visibility.
 * @returns {JSX.Element} The rendered LeftDrawerOrg component.
 *
 * @remarks
 * - Uses `useTranslation` for internationalization of text.
 * - Fetches organization data using the `GET_ORGANIZATION_DATA_PG` GraphQL query.
 * - Determines if the current page is the admin profile page based on the URL path.
 * - Adjusts drawer visibility for smaller screens when navigation links are clicked.
 *
 * @example
 * ```tsx
 * <LeftDrawerOrg
 *   targets={[{ name: 'Dashboard', url: '/dashboard' }]}
 *   orgId="12345"
 *   hideDrawer={false}
 *   setHideDrawer={setHideDrawerFunction}
 * />
 * ```
 *
 * @dependencies
 * - `useTranslation` from `react-i18next` for translations.
 * - `useQuery` from `@apollo/client` for fetching GraphQL data.
 * - `useLocalStorage` for accessing user data from local storage.
 * - `useLocation` from `react-router-dom` for accessing the current URL path.
 *
 * @internal
 * This component is part of the Talawa Admin Portal and is styled using `styles` imported from a CSS module.
 */
import { useQuery } from '@apollo/client';
import { WarningAmberOutlined } from '@mui/icons-material';
import { GET_ORGANIZATION_DATA_PG } from 'GraphQl/Queries/Queries';
import CollapsibleDropdown from 'components/CollapsibleDropdown/CollapsibleDropdown';
import IconComponent from 'components/IconComponent/IconComponent';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import type { TargetsType } from 'state/reducers/routesReducer';
import AngleRightIcon from 'assets/svgs/angleRight.svg?react';
import TalawaLogo from 'assets/svgs/talawa.svg?react';
import styles from 'style/app-fixed.module.css'; // Import the global CSS file
import Avatar from 'components/Avatar/Avatar';
import useLocalStorage from 'utils/useLocalstorage';

export interface InterfaceLeftDrawerProps {
  orgId: string;
  targets: TargetsType[];
  hideDrawer: boolean | null;
  setHideDrawer: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const leftDrawerOrg = ({
  targets,
  orgId,
  hideDrawer,
  setHideDrawer,
}: InterfaceLeftDrawerProps): JSX.Element => {
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const location = useLocation();
  const { getItem } = useLocalStorage();
  const userId = getItem('id');
  const getIdFromPath = (pathname: string): string => {
    if (!pathname) return '';
    const segments = pathname.split('/');

    // Index 2 (third segment) represents the ID in paths like /member/{userId}

    return segments.length > 2 ? segments[2] : '';
  };
  const [isProfilePage, setIsProfilePage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  // const [organization, setOrganization] = useState<InterfaceOrganizationPg>();
  const { data, loading } = useQuery(GET_ORGANIZATION_DATA_PG, {
    variables: { id: orgId },
  });

  // Get the ID from the current path

  const pathId = useMemo(
    () => getIdFromPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (hideDrawer === null) {
      setHideDrawer(false);
    }
  }, []);

  // Check if the current page is admin profile page

  useEffect(() => {
    // if param id is equal to userId, then it is a profile page
    setIsProfilePage(pathId === userId);
  }, [location, userId]);

  // Set organization data when query data is available
  // useEffect(() => {
  //   let isMounted = true;
  //   if (data && isMounted) {
  //     setOrganization(data?.organization);
  //   } else {
  //     setOrganization(undefined);
  //   }
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [data]);
  /**
   * Handles link click to hide the drawer on smaller screens.
   */
  const handleLinkClick = (): void => {
    if (window.innerWidth <= 820) {
      setHideDrawer(true);
    }
  };

  return (
    <>
      <div
        className={`${styles.leftDrawer} ${
          hideDrawer === null
            ? styles.hideElemByDefault
            : hideDrawer
              ? styles.inactiveDrawer
              : styles.activeDrawer
        }`}
        data-testid="leftDrawerContainer"
      >
        {/* Branding Section */}
        <div className={styles.brandingContainer}>
          <TalawaLogo className={styles.talawaLogo} />
          <span className={styles.talawaText}>
            {tCommon('talawaAdminPortal')}
          </span>
        </div>

        {/* Organization Section */}
        <div className={`${styles.organizationContainer} pe-3`}>
          {loading ? (
            <button
              className={`${styles.profileContainer} shimmer`}
              data-testid="orgBtn"
            />
          ) : data == undefined ? (
            !isProfilePage && (
              <button
                className={`${styles.profileContainer} ${styles.bgDanger} text-start text-white`}
                disabled
              >
                <div className="px-3">
                  <WarningAmberOutlined />
                </div>
                {tErrors('errorLoading', { entity: 'Organization' })}
              </button>
            )
          ) : (
            <button className={styles.profileContainer} data-testid="OrgBtn">
              <div className={styles.imageContainer}>
                {data.organization?.avatarURL ? (
                  <img
                    src={data.organization?.avatarURL}
                    alt={`profile picture`}
                  />
                ) : (
                  <Avatar
                    name={data.organization?.name}
                    containerStyle={styles.avatarContainer}
                    alt={'Dummy Organization Picture'}
                  />
                )}
              </div>
              <div className={`${styles.ProfileRightConatiner}`}>
                <div className={styles.profileText}>
                  <span className={styles.primaryText}>
                    {data.organization?.name}
                  </span>
                  <span className={styles.secondaryText}>
                    {data.organization?.city}
                  </span>
                </div>
                <div className={`${styles.ArrowIcon}`}>
                  <AngleRightIcon fill={'var(--bs-secondary)'} />
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Options List */}
        <h5 className={`${styles.titleHeader} text-secondary`}>
          {tCommon('menu')}
        </h5>
        <div className={styles.optionList}>
          {targets.map(({ name, url }, index) => {
            return url ? (
              <NavLink to={url} key={name} onClick={handleLinkClick}>
                {({ isActive }) => (
                  <button
                    key={name}
                    className={
                      isActive
                        ? styles.leftDrawerActiveButton
                        : styles.leftDrawerInactiveButton
                    }
                  >
                    <div className={styles.iconWrapper}>
                      <IconComponent
                        name={name == 'Membership Requests' ? 'Requests' : name}
                        fill={
                          isActive ? 'var(--bs-black)' : 'var(--bs-secondary)'
                        }
                      />
                    </div>
                    {tCommon(name)}
                  </button>
                )}
              </NavLink>
            ) : (
              <CollapsibleDropdown
                key={name}
                target={targets[index]}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default leftDrawerOrg;
