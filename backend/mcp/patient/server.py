from fastmcp import FastMCP
from tools import get_optimal_dose as _get_optimal_dose

mcp = FastMCP()

# Register the imported function as an MCP tool
mcp.tool(_get_optimal_dose)

if __name__ == "__main__":
    mcp.run()

# Run with `fastmcp run mcp/patient/server.py --transport streamable-http --port 8001`
