import { useParams, useNavigate } from "@tanstack/react-router";

import { AddProjectUserButton } from "../components/shared/AddProjectUserButton.tsx";
import { usePlaceUsersNavData } from "../modules/usePlaceUsersNavData.ts";
import { ListHeader } from "../components/ListHeader.tsx";
import { FilterButton } from "../components/shared/FilterButton.tsx";
import { Row } from "../components/shared/Row.tsx";
import { Loading } from "../components/shared/Loading.tsx";
import "../form.css";

export const PlaceUsers = ({ hideHeader = false }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ strict: false });
  const navigate = useNavigate();
  const usersBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/users`;

  const { loading, navData, isFiltered } = usePlaceUsersNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  });
  const { navs, label, nameSingular } = navData;

  const onUserCreated = (id: string) => {
    navigate({ to: `${usersBaseUrl}/${id}/` })
  };

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          menus={<>
            <AddProjectUserButton
              scope={{
                kind: 'place',
                projectId,
                placeId: placeId2 ?? placeId,
              }}
              onUserCreated={onUserCreated}
            />
            <FilterButton isFiltered={isFiltered} />
          </>}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={`${usersBaseUrl}/${id}/`} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  );
};
