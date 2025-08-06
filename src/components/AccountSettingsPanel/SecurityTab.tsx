import { Button } from "@/components/ui/button";

const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <Button variant="outline">驗證電子郵件</Button>
      <Button variant="outline">帳戶異常紀錄</Button>
      <Button variant="outline">帳號信譽</Button>
    </div>
  );
};

export default SecurityTab;
