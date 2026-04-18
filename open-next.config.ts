// Config for @opennextjs/cloudflare — https://opennext.js.org/cloudflare
export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      // No ISR/caching/queuing needed for this site
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  cloudflare: {
    dangerousDisableConfigValidation: true,
  },
};
