from fastmcp import FastMCP
from tools import list_patients as _list_patients

mcp = FastMCP()

# Register the imported function as an MCP tool
mcp.tool(_list_patients)

if __name__ == "__main__":
    mcp.run()

# Run with `fastmcp run mcp/patient/server.py --transport streamable-http --port 8001`
