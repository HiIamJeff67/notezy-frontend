import { UUID } from "crypto";

const BlockPackEditorNotFoundPage = ({ id }: { id?: UUID }) => {
  const notFoundMessage = id
    ? `Block pack with id of ${id} Not Found`
    : "Block pack not found";
  return (
    <div className="w-full h-full flex justify-center items-center">
      {notFoundMessage}
    </div>
  );
};

export default BlockPackEditorNotFoundPage;
