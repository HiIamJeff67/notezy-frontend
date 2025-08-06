import { Button } from "@/components/ui/button";

const BindingTab = () => {
  return (
    <div className="space-y-6">
      <Button variant="outline">綁定備用電子郵件</Button>
      <Button variant="outline">綁定電話號碼</Button>
      <Button variant="outline">綁定 Gmail</Button>
      <Button variant="outline">綁定 Meta</Button>
      <Button variant="outline">綁定 Discord</Button>
    </div>
  );
};

export default BindingTab;
