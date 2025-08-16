export default function CSSHoverDemoPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-foreground">CSS Hover Animations Demo</h1>
                    <p className="text-muted-foreground">
                        Demonstrating complex animations using CSS pseudo-classes and pseudo-elements without JavaScript
                    </p>
                </div>

                {/* Card Selection Demo */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Card Selection with :has() and Inset Effects</h2>
                    
                    <div className="card-container grid gap-4 md:grid-cols-3">
                        <div className="card group relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-lg">
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-card-foreground">Option 1</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    This card demonstrates the inset effect using ::before and ::after pseudo-elements
                                </p>
                            </div>
                            
                            {/* Inset effect using ::before and ::after */}
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
                                <div className="absolute inset-[2px] border-2 border-primary/20 rounded-lg"></div>
                            </div>
                        </div>

                        <div className="card group relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-lg">
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-card-foreground">Option 2</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Hover over this card to see the smooth transition effect
                                </p>
                            </div>
                            
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
                                <div className="absolute inset-[2px] border-2 border-primary/20 rounded-lg"></div>
                            </div>
                        </div>

                        <div className="card group relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:shadow-lg">
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-card-foreground">Option 3</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    The :has() pseudo-class detects hover state and applies effects
                                </p>
                            </div>
                            
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
                                <div className="absolute inset-[2px] border-2 border-primary/20 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Advanced :has() Demo */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Advanced :has() Selector Demo</h2>
                    
                    <div className="container-demo rounded-lg border bg-card p-6">
                        <p className="mb-4 text-sm text-muted-foreground">
                            The container changes its appearance when any child is hovered using :has()
                        </p>
                        
                        <div className="demo-container space-y-3 transition-all duration-500 has-[.demo-item:hover]:bg-muted/50 has-[.demo-item:hover]:shadow-inner">
                            <div className="demo-item rounded-md bg-background p-3 transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-md">
                                <span className="text-sm font-medium">Hover Item 1</span>
                            </div>
                            <div className="demo-item rounded-md bg-background p-3 transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-md">
                                <span className="text-sm font-medium">Hover Item 2</span>
                            </div>
                            <div className="demo-item rounded-md bg-background p-3 transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-md">
                                <span className="text-sm font-medium">Hover Item 3</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pseudo-elements Animation */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Pseudo-elements Animation</h2>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="pseudo-demo group relative overflow-hidden rounded-lg border bg-card p-6">
                            <h3 className="relative z-10 text-lg font-semibold text-card-foreground">Before/After Effects</h3>
                            <p className="relative z-10 mt-2 text-sm text-muted-foreground">
                                This uses ::before and ::after for complex layered animations
                            </p>
                            
                            <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100">
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-sm"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                <div className="absolute inset-[1px] border border-primary/30 rounded-lg"></div>
                            </div>
                        </div>

                        <div className="button-demo">
                            <button className="group relative overflow-hidden rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                <span className="relative z-10">Animated Button</span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                                <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-primary/80 to-primary transition-opacity duration-300 group-hover:opacity-100"></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Interactive List Demo */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Interactive List with Sibling Effects</h2>
                    
                    <div className="list-container space-y-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="list-item group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:bg-primary/5 hover:border-primary/30 hover:shadow-md hover:translate-x-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-card-foreground font-medium">List Item {item}</span>
                                    <div className="h-2 w-2 rounded-full bg-muted transition-all duration-300 group-hover:bg-primary group-hover:scale-150"></div>
                                </div>
                                
                                <div className="absolute left-0 top-0 h-full w-1 bg-primary scale-y-0 transition-transform duration-300 group-hover:scale-y-100 origin-center rounded-r-full"></div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mt-8 rounded-lg border bg-muted/50 p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Technical Notes</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>:has()</strong> pseudo-class detects descendant states to style parent elements</li>
                        <li>• <strong>::before</strong> and <strong>::after</strong> create additional elements for layered effects</li>
                        <li>• <strong>CSS transitions</strong> provide smooth animations between states</li>
                        <li>• <strong>Transform and opacity</strong> changes are hardware-accelerated for performance</li>
                        <li>• <strong>Group hover</strong> utilities in Tailwind CSS simplify parent-child hover interactions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}