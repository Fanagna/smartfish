import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BarSeries({ data, dataKey = "value", xKey = "name", color = "var(--primary)" }: { data: any[]; dataKey?: string; xKey?: string; color?: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
          <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
