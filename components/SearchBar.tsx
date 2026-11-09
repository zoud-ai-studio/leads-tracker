type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return <label className="search-bar">Search leads<input aria-label="Search leads" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Name or company" /></label>;
}
