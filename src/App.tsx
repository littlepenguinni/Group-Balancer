import { useState } from 'react';
import { Users, Plus, Trash2, Shuffle } from 'lucide-react';

interface Person {
    id: string;
    name: string;
    potential: number;
}

interface Group {
    members: Person[];
    totalPotential: number;
}

export default function TeamBalancer() {
    const [people, setPeople] = useState<Person[]>([
        { id: '1', name: 'Alex', potential: 7 },
        { id: '2', name: 'Jordan', potential: 6.5 },
        { id: '3', name: 'Taylor', potential: 5 },
        { id: '4', name: 'Morgan', potential: 6 },
        { id: '5', name: 'Casey', potential: 4.5 },
        { id: '6', name: 'Riley', potential: 5.5 },
        { id: '7', name: 'Jamie', potential: 3 },
        { id: '8', name: 'Avery', potential: 7 },
        { id: '9', name: 'Quinn', potential: 4 },
        { id: '10', name: 'Drew', potential: 6.5 },
        { id: '11', name: 'Sam', potential: 5 },
        { id: '12', name: 'Charlie', potential: 3.5 },
        { id: '13', name: 'Rowan', potential: 5.5 },
        { id: '14', name: 'Skylar', potential: 4.5 },
        { id: '15', name: 'Phoenix', potential: 6 },
        { id: '16', name: 'River', potential: 5 },
    ]);
    const [name, setName] = useState('');
    const [potential, setPotential] = useState(4);
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupSize, setGroupSize] = useState(5);
    const [error, setError] = useState('');

    const addPerson = () => {
        if (name.trim()) {
            setPeople([...people, { id: Date.now().toString(), name: name.trim(), potential }]);
            setName('');
            setPotential(4);
            setError('');
        }
    };

    const removePerson = (id: string) => {
        setPeople(people.filter(p => p.id !== id));
        setError('');
    };

    const balanceGroups = () => {
        setError('');

        if (people.length < 3) {
            setError('Need at least 3 people to create groups');
            return;
        }

        // Find the best configuration for odd-numbered groups
        const bestConfig = findBestGroupConfiguration(people.length, groupSize);

        if (!bestConfig) {
            setError(`Cannot create odd-numbered groups with ${people.length} people. Try adding or removing people.`);
            return;
        }

        // Sort people by potential (descending)
        const sorted = [...people].sort((a, b) => b.potential - a.potential);

        // Initialize groups based on configuration
        const newGroups: Group[] = bestConfig.map(() => ({
            members: [],
            totalPotential: 0
        }));

        // Use greedy algorithm: always add next person to group with lowest total
        sorted.forEach(person => {
            // Find group with lowest total that still needs members
            let minIdx = 0;
            let minTotal = Infinity;

            for (let i = 0; i < newGroups.length; i++) {
                if (newGroups[i].members.length < bestConfig[i] && newGroups[i].totalPotential < minTotal) {
                    minTotal = newGroups[i].totalPotential;
                    minIdx = i;
                }
            }

            newGroups[minIdx].members.push(person);
            newGroups[minIdx].totalPotential += person.potential;
        });

        // Final verification - allow one even group
        const evenGroups = newGroups.filter(g => g.members.length % 2 === 0);
        if (evenGroups.length > 1) {
            setError('Error: Created too many groups with even numbers.');
            return;
        }

        setGroups(newGroups);
    };

    // Find the best way to split people into odd-numbered groups
    const findBestGroupConfiguration = (totalPeople: number, preferredSize: number): number[] | null => {
        // First, try to find configurations where ALL groups are odd
        const oddSizes = [3, 5, 7, 9, 11];
        const bestConfigs: number[][] = [];

        // Generate possible configurations
        function findOddConfigurations(remaining: number, currentConfig: number[], minSize: number): void {
            if (remaining === 0) {
                bestConfigs.push([...currentConfig]);
                return;
            }

            if (remaining < minSize) return;

            // Try each odd size
            for (const size of oddSizes) {
                if (size <= remaining && size >= minSize) {
                    currentConfig.push(size);
                    findOddConfigurations(remaining - size, currentConfig, 3);
                    currentConfig.pop();
                }
            }
        }

        findOddConfigurations(totalPeople, [], 3);

        if (bestConfigs.length > 0) {
            // Score each configuration based on:
            // 1. Closeness to preferred size
            // 2. Uniformity of group sizes
            const scored = bestConfigs.map(config => {
                const avgDiff = config.reduce((sum, size) => sum + Math.abs(size - preferredSize), 0) / config.length;
                const variance = config.reduce((sum, size) => {
                    const diff = size - (totalPeople / config.length);
                    return sum + diff * diff;
                }, 0);
                return { config, score: avgDiff + variance / 10 };
            });

            // Sort by score (lower is better)
            scored.sort((a, b) => a.score - b.score);

            // Return best configuration, sorted by size descending
            const best = scored[0].config;
            best.sort((a, b) => b - a);
            return best;
        }

        // If no all-odd solution exists, allow one even group
        const numGroups = Math.round(totalPeople / preferredSize);
        if (numGroups === 0) return null;

        const baseSize = Math.floor(totalPeople / numGroups);
        const remainder = totalPeople % numGroups;

        const config: number[] = new Array(numGroups).fill(baseSize);
        for (let i = 0; i < remainder; i++) {
            config[i]++;
        }

        config.sort((a, b) => b - a);
        return config;
    };

    const avgPotential = groups.length > 0
        ? (groups.reduce((sum, g) => sum + g.totalPotential, 0) / groups.length).toFixed(1)
        : '0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Team Balancer</h1>
                    </div>

                    {/* Add Person Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Person</h2>
                        <div className="flex flex-wrap gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Group:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    step="0.5"
                                    value={potential}
                                    onChange={(e) => setPotential(Math.min(7, Math.max(1, Number(e.target.value))))}
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={addPerson}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* People List */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            People ({people.length})
                        </h2>
                        {people.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No people added yet. Add people above to get started.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {people.map(person => (
                                    <div
                                        key={person.id}
                                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-gray-800">{person.name}</span>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-semibold">
                        {person.potential}
                      </span>
                                        </div>
                                        <button
                                            onClick={() => removePerson(person.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Generate Groups */}
                    <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Preferred Group Size:</label>
                            <select
                                value={groupSize}
                                onChange={(e) => setGroupSize(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={7}>7</option>
                            </select>
                        </div>
                        <button
                            onClick={balanceGroups}
                            disabled={people.length < 3}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <Shuffle className="w-4 h-4" />
                            Generate Balanced Groups
                        </button>
                    </div>
                </div>

                {/* Groups Display */}
                {groups.length > 0 && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Balanced Groups</h2>
                            <p className="text-gray-600">
                                Average Group Score: <span className="font-semibold text-indigo-600">{avgPotential}</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group, idx) => {
                                const variance = Math.abs(group.totalPotential - parseFloat(avgPotential));
                                const isBalanced = variance < 2;
                                return (
                                    <div
                                        key={idx}
                                        className={`border-2 rounded-lg p-5 ${
                                            isBalanced ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Group {idx + 1} ({group.members.length}{group.members.length % 2 === 0 ? ' ⚠️' : ''})
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                isBalanced ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                            }`}>
                        {group.totalPotential.toFixed(1)}
                      </span>
                                        </div>
                                        <ul className="space-y-2">
                                            {group.members.map(person => (
                                                <li key={person.id} className="flex justify-between items-center">
                                                    <span className="text-gray-700">{person.name}</span>
                                                    <span className="text-sm font-semibold text-gray-600">
                            {person.potential}
                          </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}