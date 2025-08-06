import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const UpgradeTab = () => {
  return (
    <div className="space-y-6">
      <Label>升級方案</Label>
      <div className="flex gap-4">
        <Button variant="outline">Free</Button>
        <Button variant="outline">Pro</Button>
        <Button variant="outline">Ultimate</Button>
        <Button variant="outline">Enterprise</Button>
      </div>
      <Label>付款週期</Label>
      <div className="flex gap-4">
        <Button variant="outline">月付</Button>
        <Button variant="outline">年付</Button>
      </div>
    </div>
  );
};

export default UpgradeTab;
