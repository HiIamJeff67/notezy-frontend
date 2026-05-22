import type { UUID } from "crypto";

const MaterialViewerNotFoundPage = ({ id }: { id?: UUID }) => {
  const notFoundMessage = id
    ? `Material with id of ${id} Not Found`
    : "Material not found";
  return (
    <div className="w-full h-full flex justify-center items-center">
      {notFoundMessage}
    </div>
  );
};

export default MaterialViewerNotFoundPage;
