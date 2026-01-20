import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/**
 * UIコンポーネントテストページ
 * すべてのバリアントを表示して動作確認
 */
export default function TestUIPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-12 text-4xl font-bold">UIコンポーネントテスト</h1>

      {/* Card Component Tests */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">Card コンポーネント</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="default">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Default Card</h3>
              <p className="text-gray-600">
                デフォルトスタイルのカードです。ホバーで影が濃くなります。
              </p>
            </div>
          </Card>

          <Card variant="featured">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Featured Card</h3>
              <p className="text-gray-600">
                注目コンテンツ用のカードです。グラデーション背景とプライマリカラーの影が特徴です。
              </p>
            </div>
          </Card>

          <Card variant="default" href="/test">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Clickable Card (Default)</h3>
              <p className="text-gray-600">リンク付きカード。ホバーで上に移動します。</p>
            </div>
          </Card>

          <Card variant="featured" href="/test">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Clickable Card (Featured)</h3>
              <p className="text-gray-600">リンク付きの注目カード。ホバーで上に移動します。</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Badge Component Tests */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">Badge コンポーネント</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="urgent" label="緊急" />
          <Badge variant="news" label="お知らせ" />
          <Badge variant="other" label="その他" />
          <Badge variant="day1" label="1日目" />
          <Badge variant="day2" label="2日目" />
          <Badge variant="both" label="両日開催" />
          <Badge variant="room" label="教室企画" />
          <Badge variant="stage" label="ステージ企画" />
          <Badge variant="special" label="特別企画" />
        </div>
      </section>

      {/* Button Component Tests */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">Button コンポーネント</h2>

        {/* Primary Buttons */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Primary Variant</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">
              Small Button
            </Button>
            <Button variant="primary" size="md">
              Medium Button
            </Button>
            <Button variant="primary" size="lg">
              Large Button
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled Button
            </Button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Secondary Variant</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" size="sm">
              Small Button
            </Button>
            <Button variant="secondary" size="md">
              Medium Button
            </Button>
            <Button variant="secondary" size="lg">
              Large Button
            </Button>
          </div>
        </div>

        {/* Outline Buttons */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Outline Variant</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">
              Small Button
            </Button>
            <Button variant="outline" size="md">
              Medium Button
            </Button>
            <Button variant="outline" size="lg">
              Large Button
            </Button>
          </div>
        </div>

        {/* Full Width Button */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Full Width Button</h3>
          <Button variant="primary" size="lg" fullWidth>
            Full Width Button
          </Button>
        </div>
      </section>
    </div>
  );
}
